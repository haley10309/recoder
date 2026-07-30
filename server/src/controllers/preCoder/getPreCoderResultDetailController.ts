import { Response } from "express";
import { RowDataPacket } from "mysql2";

import initDB from "../../config/initDB";
import { AuthRequest } from "../../types/auth.types";

// 상세 조회 시에만 html_content / copy_deck_json / result_json을 함께 내려준다.
export const getPreCoderResultDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = await initDB();

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, title, html_filename, html_content, excel_filename, copy_deck_json, result_json, created_by_name, created_at
       FROM PreCoderResults
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: "결과를 찾을 수 없습니다." });
      return;
    }

    res.json({ success: true, result: rows[0] });
  } catch (err) {
    console.error("getPreCoderResultDetail error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch pre-coder result detail" });
  }
};
