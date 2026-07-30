import { Response } from "express";
import { RowDataPacket } from "mysql2";

import initDB from "../../config/initDB";
import { AuthRequest } from "../../types/auth.types";

// 목록에서는 html_content / excel_file / *_json 같은 대용량 컬럼을 절대 조회하지 않는다.
// (상세 조회 시에만 필요한 데이터를 불러오는 lazy-loading 원칙)
export const getPreCoderResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = await initDB();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, title, html_filename, excel_filename, created_by_name, created_at
       FROM PreCoderResults
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );

    res.json({ success: true, results: rows });
  } catch (err) {
    console.error("getPreCoderResults error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch pre-coder results" });
  }
};
