import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { Request, Response } from "express";
import { ExtractUnpackExcelResponse, UnpackRow } from "../../types/unpack.types";

type PythonResult =
  | { row_list: UnpackRow[] }
  | { errorMsg: string; statusCode: number };

export const extractUnpackExcel = async (
  req: Request,
  res: Response<ExtractUnpackExcelResponse>
) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded." });
      return;
    }

    // const countryCode =
    //   typeof req.body.countryCode === "string"
    //     ? req.body.countryCode.trim()
    //     : "";
    const countryCode = "CA_FR"; // TODO: 없어도 되도록 수정해야됨

    // if (!countryCode) {
    //   res.status(400).json({ error: "countryCode is required." });
    //   return;
    // }

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

    const py = spawn("python", [pythonScriptPath, tempPath, countryCode], {
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

    const safeSend = (statusCode: number, body: ExtractUnpackExcelResponse) => {
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

        const row_list = result.row_list.map((row) => ({
          ...row,
          row_order: row.row_order ? Number(row.row_order) : undefined,
          exclude_sup: row.exclude_sup && String(row.exclude_sup).toUpperCase() === "O" ? true : false,
          enable_text_transform: row.enable_text_transform && String(row.enable_text_transform).toUpperCase() === "O" ? true : false,
          translated_copy: "", // extractUnpackExcel에선 필요없음
        }))

        safeSend(200, { success: true, row_list });
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
};