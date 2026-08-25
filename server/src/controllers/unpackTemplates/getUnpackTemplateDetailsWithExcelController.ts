import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";

import initDB from "../../config/initDB";
import { GetUnpackTemplateDetailsWithExcelBody, GetUnpackTemplateDetailsWithExcelResponse, UnpackRow } from "../../types/unpack.types";

type PythonResult =
  | { row_list: UnpackRow[] }
  | { errorMsg: string; statusCode: number };


export const getUnpackTemplateDetailsWithExcel = async (
  req: Request<{}, {}, GetUnpackTemplateDetailsWithExcelBody>,
  res: Response<GetUnpackTemplateDetailsWithExcelResponse>
): Promise<void> => {
  const { ticket_num, ticket_url, country_code } = req.body;

  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded." });
      return;
    }
    if (!ticket_num || !ticket_url) {
      res.status(400).json({ success: false, error: "ticket_num and ticket_url are required." });
      return;
    }
    if (!country_code) {
      res.status(400).json({ success: false, error: "country_code is required." });
      return;
    }

    const countryCode = country_code.trim().toUpperCase(); // 대문자

    const db = await initDB();

    // 1. template 조회
    const [templates] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates 
       WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );
    if (templates.length === 0) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }
    if (templates.length > 1) {
      res.status(409).json({ success: false, error: "Multiple templates found" });
      return;
    }

    const templateId = templates[0].id;

    // 2. unpack specs 조회
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT *
       FROM TemplateUnpackSpecs
       WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    // 3. 응답 구조 변환
    let db_row_list: UnpackRow[] = rows.map((row: any) => ({
      id: row.id,
      row_order: row.row_order ?? undefined,
      target_selector: row.target_selector,
      apply_type: row.apply_type,
      exclude_sup: Boolean(row.exclude_sup),
      enable_text_transform: Boolean(row.enable_text_transform),
      original_copy: row.original_copy ?? undefined,
    }));



    try {
      const uniqueFileName = `${Date.now()}_${req.file.originalname}`;
      const tempPath = path.join(os.tmpdir(), uniqueFileName);

      fs.writeFileSync(tempPath, req.file.buffer); // 파일을 해당 tempPath에 생성한다. 업로드 된 파일 내용을 넣고
      const pythonScriptPath = path.join(
        process.cwd(),
        "src",
        "controllers",
        "unpackTemplates",
        "extract_unpack_excel.py"
      );

      const isPkg = !!(process as any).pkg;
      const command = isPkg
        ? path.join(path.dirname(process.execPath), "extract_unpack_excel.exe")
        : "python";
      const args = isPkg
        ? [tempPath, countryCode]
        : [pythonScriptPath, tempPath, countryCode];
      
      console.log("[extract] cwd:", process.cwd());
      console.log("[extract] execPath:", process.execPath);
      console.log("[extract] pythonScriptPath:", pythonScriptPath);
      console.log("[extract] script exists:", fs.existsSync(pythonScriptPath));

      const py = spawn(command, args, {
        cwd: process.cwd(),
      });

      let stdout = "";
      let stderr = "";
      let responseSent = false;

      const cleanupTempFile = () => {
        try {
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        } catch (unlinkError) {
          console.error("temp file delete error:", unlinkError);
        }
      };

      const safeSend = (statusCode: number, body: GetUnpackTemplateDetailsWithExcelResponse) => {
        if (responseSent) return;
        responseSent = true;
        res.status(statusCode).json(body);
      };

      py.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      py.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      py.on("close", (code) => {
        console.log("[extract] python exit code:", code); 
        cleanupTempFile();

        if (code !== 0) {
          console.error("python stderr:", stderr);
          console.error("python stdout:", stdout);

          try {
            const result: PythonResult = JSON.parse(stdout);

            if ("errorMsg" in result) {
              safeSend(result.statusCode || 500, { success: false, error: result.errorMsg });
              return;
            }
          } catch {
            // stdout이 JSON이 아니면 아래 공통 에러 처리
          }

          safeSend(500, { success: false,error: "Internal Server Error" });
          return;
        }

        try {
          const result: PythonResult = JSON.parse(stdout);

          if ("errorMsg" in result) {
            safeSend(result.statusCode || 500, { success: false, error: result.errorMsg });
            return;
          }

          const excel_row_list = result.row_list.map((row) => ({
            ...row,
            row_order: row.row_order ? Number(row.row_order) : undefined,
            exclude_sup: row.exclude_sup && String(row.exclude_sup).toUpperCase() === "O" ? true : false,
            enable_text_transform: row.enable_text_transform && String(row.enable_text_transform).toUpperCase() === "O" ? true : false,
          }));

          // ===== 임시 디버깅 =====
          console.log("[excel] 총 행수:", excel_row_list.length);
          console.log("[excel] 첫 행 필드:", Object.keys(excel_row_list[0] ?? {}));
          console.log("[excel] 첫 행:", excel_row_list[0]);
          console.log("[excel] SCHEMA 행수:",
            excel_row_list.filter((r: any) => /^SCHEMA/i.test(String(r.key ?? ""))).length);
          // =====================

          db_row_list = db_row_list.map((db_row) => {
            // excel_row_list 에서 일치하는 항목을 찾는다.
            const matched = excel_row_list.find(
              (excel_row) => {
                return excel_row.target_selector === db_row.target_selector &&
                excel_row.apply_type === db_row.apply_type
              }
            );
            return {
              ...db_row,
              translated_copy: matched?.translated_copy ?? "",
            };
          });

          // =========================
          // SCHEMA 행 추가
          // =========================
          // SCHEMA 행은 셀렉터가 없어 TemplateUnpackSpecs에 저장되지 않는다.
          // 따라서 DB 기준 매핑에서 누락되므로 엑셀 데이터를 그대로 이어붙인다.
          const schema_row_list: UnpackRow[] = excel_row_list
            .filter((row) => /^SCHEMA-/i.test(row.key ?? ""))
            .map((row, index) => ({
              id: -(index + 1),
              row_order: row.row_order ?? index + 1,
              key: row.key,
              target_selector: "",
              apply_type: "",
              exclude_sup: false,
              enable_text_transform: false,
              category: row.category,
              item: row.item,
              original_copy: row.original_copy ?? "",
              translated_copy: row.translated_copy ?? "",
            }));

          console.log("[merge] DB 행:", db_row_list.length, "/ SCHEMA 행:", schema_row_list.length);

          safeSend(200, { success: true, row_list: [...db_row_list, ...schema_row_list] });
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("python stdout:", stdout);
            console.error("python stderr:", stderr);
            safeSend(500, { success: false, error: "Invalid Python response format." });
          }
      });

      py.on("error", (error) => {
        cleanupTempFile();
        console.error("python spawn error:", error);
        safeSend(500, { success: false, error: "Failed to start Python process." });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }

  } catch (err) {
    console.error("Error fetching unpack template details with excel:", err);
    res.status(500).json({ success: false, error: "Failed to fetch unpack template details with excel" });
  }
};