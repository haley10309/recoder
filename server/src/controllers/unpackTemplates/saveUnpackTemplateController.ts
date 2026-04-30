import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";

import initDB from "../../config/initDB";
import {
  SaveUnpackTemplateBody,
  SaveUnpackTemplateResponse,
  UnpackRow,
} from "../../types/unpack.types";

export const saveUnpackTemplate = async (
  req: Request<{}, {}, SaveUnpackTemplateBody>,
  res: Response<SaveUnpackTemplateResponse>
): Promise<void> => {
  const { ticket_num, ticket_url, row_list } = req.body;

  // 1. validation
  if (!ticket_num || !ticket_url) {
    res.status(400).json({
      success: false,
      error: "ticket_num and ticket_url are required",
    });
    return;
  }

  if (!Array.isArray(row_list)) {
    res.status(400).json({
      success: false,
      error: "row_list must be an array",
    });
    return;
  }

  let db: Connection | undefined;

  try {
    db = await initDB();
    await db.beginTransaction();

    // 2. template 조회
    const [templates] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates 
       WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    let templateId: number;

    if (templates.length === 0) {
      // 없으면 생성
      const [insertResult] = await db.execute<ResultSetHeader>(
        `INSERT INTO Templates (ticket_num, ticket_url) VALUES (?, ?)`,
        [ticket_num, ticket_url]
      );
      templateId = insertResult.insertId;
    } else if (templates.length > 1) {
      await db.rollback();
      res.status(409).json({
        success: false,
        error: "Multiple templates found",
      });
      return;
    } else {
      templateId = templates[0].id;
    }

    // 3. 기존 unpack spec 조회
    const [existingRows] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM TemplateUnpackSpecs 
       WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    const existingIds = existingRows.map((row) => row.id);

    const incomingIds = row_list
      .filter((row) => (row as any).id)
      .map((row: any) => row.id);

    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    // 4. 삭제 대상 soft delete
    for (const id of idsToDelete) {
      await db.execute(
        `UPDATE TemplateUnpackSpecs SET deleted_at = NOW() WHERE id = ?`,
        [id]
      );
    }

    // 5. upsert
    for (const row of row_list) {
      const {
        id,
        row_order,
        target_selector,
        apply_type,
        exclude_sup,
        enable_text_transform,
        original_copy,
      } = row as UnpackRow & { id?: number };

      if (id) {
        // UPDATE
        await db.execute(
          `UPDATE TemplateUnpackSpecs
           SET 
             row_order = ?, 
             target_selector = ?, 
             apply_type = ?, 
             exclude_sup = ?, 
             enable_text_transform = ?, 
             original_copy = ?
           WHERE id = ?`,
          [
            row_order ?? null,
            target_selector,
            apply_type,
            exclude_sup ? 1 : 0,
            enable_text_transform ? 1 : 0,
            original_copy ?? null,
            id,
          ]
        );
      } else {
        // INSERT
        await db.execute(
          `INSERT INTO TemplateUnpackSpecs
           (row_order, target_selector, apply_type, exclude_sup, enable_text_transform, original_copy, template_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            row_order ?? null,
            target_selector,
            apply_type,
            exclude_sup ? 1 : 0,
            enable_text_transform ? 1 : 0,
            original_copy ?? null,
            templateId,
          ]
        );
      }
    }

    await db.commit();

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("saveUnpackTemplate error:", err);
    if (db) await db.rollback();

    res.status(500).json({
      success: false,
      error: "Failed to save unpack template",
    });
  }
};