import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { Request, Response } from "express";

import { RecoveryHtmlBody, RecoveryMode, RecoveryReport } from "../../types/unpack.types";
import { removeElementsByCopySet } from "../../utils/htmlElementRemove";

type PythonResult =
  | {
      copy_set_list: string[];
      header: { name: string; row: number; column: string };
      skipped_count: number;
    }
  | { errorMsg: string; statusCode: number };

type UploadedFiles = { [field: string]: Express.Multer.File[] };

const VALID_MODES: RecoveryMode[] = ["remove_matched", "remove_unmatched"];

export const recoveryHtml = async (
  req: Request<{}, {}, RecoveryHtmlBody>,
  res: Response
): Promise<void> => {
  const files = req.files as UploadedFiles | undefined;

  const htmlFile = files?.html_file?.[0];
  const excelFile = files?.excel_file?.[0];

  try {
    if (!htmlFile) {
      res.status(400).json({ success: false, error: "HTML 파일이 필요합니다." });
      return;
    }

    if (!excelFile) {
      res.status(400).json({ success: false, error: "Excel 파일이 필요합니다." });
      return;
    }

    const mode = req.body.mode as RecoveryMode;

    if (!VALID_MODES.includes(mode)) {
      res.status(400).json({ success: false, error: "mode 값이 올바르지 않습니다." });
      return;
    }

    // =========================
    // Excel → copy-set 번호 추출
    // =========================
    const uniqueFileName = `${Date.now()}_${excelFile.originalname}`;
    const tempPath = path.join(os.tmpdir(), uniqueFileName);

    fs.writeFileSync(tempPath, excelFile.buffer);

    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "controllers",
      "unpackTemplates",
      "extract_copy_set.py"
    );

    const isPkg = !!(process as any).pkg;
    const command = isPkg
      ? path.join(path.dirname(process.execPath), "extract_copy_set.exe")
      : "python";
    const args = isPkg ? [tempPath] : [pythonScriptPath, tempPath];

    const py = spawn(command, args, { cwd: process.cwd() });

    let stdout = "";
    let stderr = "";
    let responseSent = false;

    const cleanupTempFile = () => {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (unlinkError) {
        console.error("[recovery] temp file delete error:", unlinkError);
      }
    };

    const safeSendError = (statusCode: number, error: string) => {
      if (responseSent) return;
      responseSent = true;
      res.status(statusCode).json({ success: false, error });
    };

    py.stdout.on("data", (data) => { stdout += data.toString(); });
    py.stderr.on("data", (data) => { stderr += data.toString(); });

    py.on("close", (code) => {
      cleanupTempFile();

      if (code !== 0) {
        console.error("[recovery] python stderr:", stderr);
        console.error("[recovery] python stdout:", stdout);

        try {
          const result: PythonResult = JSON.parse(stdout);
          if ("errorMsg" in result) {
            safeSendError(result.statusCode || 500, result.errorMsg);
            return;
          }
        } catch {
          // stdout이 JSON이 아니면 아래 공통 에러 처리
        }

        safeSendError(500, "Excel 파싱에 실패했습니다.");
        return;
      }

      try {
        const result: PythonResult = JSON.parse(stdout);

        if ("errorMsg" in result) {
          safeSendError(result.statusCode || 500, result.errorMsg);
          return;
        }

        const excelSet = new Set(result.copy_set_list);

        if (excelSet.size === 0) {
        safeSendError(
            400,
            `${result.header.name} 컬럼(${result.header.column}열)에서 data-copy-set 번호를 찾지 못했습니다.`
        );
        return;
        }

        // =========================
        // HTML에서 요소 삭제
        // =========================
        const originalHtml = htmlFile.buffer.toString("utf-8");

        const shouldRemove =
          mode === "remove_matched"
            ? (copySet: string) => excelSet.has(copySet)
            : (copySet: string) => !excelSet.has(copySet);

        const { html, removed, foundInHtml } = removeElementsByCopySet(
          originalHtml,
          shouldRemove
        );

        const removedSet = new Set(removed.map((r) => r.copySet));

        const report: RecoveryReport = {
            mode,
            excelCount: excelSet.size,
            htmlCount: foundInHtml.length,
            removedCount: removed.length,
            removed: Array.from(removedSet).sort(),
            kept: foundInHtml.filter((v) => !removedSet.has(v)).sort(),
            source: result.header,
            skippedCount: result.skipped_count,
        };

        console.log(
        `[recovery] mode=${mode} source=${result.header.name}(${result.header.column}${result.header.row}) ` +
        `excel=${report.excelCount} html=${report.htmlCount} removed=${report.removedCount}`
        );

        if (responseSent) return;
        responseSent = true;

        const originalName = path.parse(htmlFile.originalname).name;
        const suffix = mode === "remove_matched" ? "matched" : "unmatched";

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${originalName}_recovery_${suffix}.html"`
        );
        res.setHeader(
          "X-Recovery-Report",
          Buffer.from(JSON.stringify(report), "utf-8").toString("base64")
        );
        res.setHeader(
          "Access-Control-Expose-Headers",
          "X-Recovery-Report, Content-Disposition"
        );

        res.send(html);
      } catch (parseError) {
        console.error("[recovery] JSON parse error:", parseError);
        console.error("[recovery] python stdout:", stdout);
        safeSendError(500, "Invalid Python response format.");
      }
    });

    py.on("error", (error) => {
      cleanupTempFile();
      console.error("[recovery] python spawn error:", error);
      safeSendError(500, "Failed to start Python process.");
    });
  } catch (err) {
    console.error("[recovery] Error:", err);
    res.status(500).json({ success: false, error: "Failed to recover html" });
  }
};