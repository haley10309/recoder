import { Response } from "express";
import { RowDataPacket } from "mysql2";

import initDB from "../../config/initDB";
import { AuthRequest } from "../../types/auth.types";

// 저장자 본인(created_by_id)만 결과 제목을 수정할 수 있다.
export const updatePreCoderResultTitle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body as { title?: string };

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, error: "제목을 입력해주세요." });
      return;
    }

    const db = await initDB();

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT created_by_id FROM PreCoderResults WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: "결과를 찾을 수 없습니다." });
      return;
    }

    const ownerId = rows[0].created_by_id;
    if (ownerId !== null && ownerId !== req.user?.id) {
      res.status(403).json({ success: false, error: "저장자 본인만 이름을 수정할 수 있습니다." });
      return;
    }

    await db.query(`UPDATE PreCoderResults SET title = ? WHERE id = ?`, [title.trim(), id]);

    res.json({ success: true, title: title.trim() });
  } catch (err) {
    console.error("updatePreCoderResultTitle error:", err);
    res.status(500).json({ success: false, error: "Failed to update title" });
  }
};
