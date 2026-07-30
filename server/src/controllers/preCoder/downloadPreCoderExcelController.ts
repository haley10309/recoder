import { Response } from "express";
import { RowDataPacket } from "mysql2";

import initDB from "../../config/initDB";
import { AuthRequest } from "../../types/auth.types";

export const downloadPreCoderExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = await initDB();

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT excel_filename, excel_file FROM PreCoderResults WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: "파일을 찾을 수 없습니다." });
      return;
    }

    const { excel_filename, excel_file } = rows[0];

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(excel_filename)}"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excel_file);
  } catch (err) {
    console.error("downloadPreCoderExcel error:", err);
    res.status(500).json({ success: false, error: "Failed to download excel file" });
  }
};
