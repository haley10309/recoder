import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { Request, Response } from "express";
import { ExtractFaqCopyDeckResponse, FaqCopyDeckRow } from "../../types/preCoder.types";

type PythonResult =
  | { row_list: FaqCopyDeckRow[] }
  | { errorMsg: string; statusCode: number };

export const extractFaqCopyDeck = async (
  req: Request,
  res: Response<ExtractFaqCopyDeckResponse>
) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded." });
      return;
    }

    const uniqueFileName = `${Date.now()}_${req.file.originalname}`;
    const tempPath = path.join(os.tmpdir(), uniqueFileName);

    fs.writeFileSync(tempPath, req.file.buffer);
    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "controllers",
      "preCoder",
      "extract_faq_copydeck.py"
    );

    // pkg로 빌드된 exe 환경에서는 서버 exe 옆의 extract_faq_copydeck.exe를 실행
    const isPkg = !!(process as any).pkg;
    const command = isPkg
      ? path.join(path.dirname(process.execPath), "extract_faq_copydeck.exe")
      : "python";
    const args = isPkg ? [tempPath] : [pythonScriptPath, tempPath];

    console.log("[extractFaqCopyDeck] cwd:", process.cwd());
    console.log("[extractFaqCopyDeck] pythonScriptPath:", pythonScriptPath);
    console.log("[extractFaqCopyDeck] script exists:", fs.existsSync(pythonScriptPath));

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

    const safeSend = (statusCode: number, body: ExtractFaqCopyDeckResponse) => {
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
      console.log("[extractFaqCopyDeck] python exit code:", code);
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

        safeSend(500, { success: false, error: "Internal Server Error" });
        return;
      }

      try {
        const result: PythonResult = JSON.parse(stdout);

        if ("errorMsg" in result) {
          safeSend(result.statusCode || 500, { success: false, error: result.errorMsg });
          return;
        }

        safeSend(200, { success: true, row_list: result.row_list });
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
