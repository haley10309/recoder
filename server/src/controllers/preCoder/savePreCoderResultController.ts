import { Response } from "express";
import { ResultSetHeader } from "mysql2";

import initDB from "../../config/initDB";
import { AuthRequest } from "../../types/auth.types";
import { SavePreCoderResultBody } from "../../types/preCoder.types";

// html 파일 + 카피덱 xlsx + 검사 결과(JSON)를 DB에 저장해 다른 사용자들도 볼 수 있게 한다.
export const savePreCoderResult = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const htmlFile = files?.htmlFile?.[0];
    const excelFile = files?.excelFile?.[0];
    const { title, copyDeckJson, resultJson } = req.body as SavePreCoderResultBody;

    if (!htmlFile || !excelFile) {
      res.status(400).json({
        success: false,
        error: "htmlFile과 excelFile을 모두 업로드해주세요.",
      });
      return;
    }

    if (!copyDeckJson || !resultJson) {
      res.status(400).json({
        success: false,
        error: "copyDeckJson과 resultJson이 필요합니다.",
      });
      return;
    }

    const db = await initDB();

    // ⚠️ LONGTEXT/LONGBLOB처럼 큰 데이터를 execute()에 바인딩하면 잘리는 이슈가 있어
    //    (기존 AE Automation Tool에서도 동일 이슈로 execute → query 전환) query()를 사용한다.
    const [result] = await db.query(
      `INSERT INTO PreCoderResults
        (title, html_filename, html_content, excel_filename, excel_file, copy_deck_json, result_json, created_by_id, created_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title?.trim() || htmlFile.originalname,
        htmlFile.originalname,
        htmlFile.buffer.toString("utf-8"),
        excelFile.originalname,
        excelFile.buffer,
        copyDeckJson,
        resultJson,
        req.user?.id ?? null,
        req.user?.name_en ?? req.user?.email ?? null,
      ]
    );

    res.json({ success: true, id: (result as ResultSetHeader).insertId });
  } catch (err) {
    console.error("savePreCoderResult error:", err);
    res.status(500).json({ success: false, error: "Failed to save pre-coder result" });
  }
};
