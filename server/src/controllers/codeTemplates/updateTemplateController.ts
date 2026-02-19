// 템플릿 수정 (기존 값은 update, 새 값은 insert, 사라진 건 delete)
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";

import initDB from "../../config/initDB";
import { CodeChangeWithId, UpdateTemplateBody, UpdateTemplateResponse } from "../../types/codeTemplate.types";

export const updateTemplate = async (
  req: Request<{}, {}, UpdateTemplateBody>,
  res: Response<UpdateTemplateResponse>
): Promise<void> => {
  const { ticket_num, ticket_url, code_changes } = req.body;

  if (!ticket_num || !ticket_url) {
    res.status(400).json({ error: "ticket_num and ticket_url are required for updating." });
    return;
  }

  let parsedCodeChanges: CodeChangeWithId[];
  try {
    parsedCodeChanges = JSON.parse(code_changes);
  } catch (error) {
    res.status(400).json({ error: "Invalid format for code_changes" });
    return;
  }

  let db: Connection | undefined;
  try {
    db = await initDB();
    await db.beginTransaction();

    // 1. Template 조회
    const [templates] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    if (templates.length === 0) {
      await db.rollback();
      res.status(404).json({ message: "Template not found" });
      return;
    }
    if (templates.length >= 2) {
      await db.rollback();
      res.status(404).json({ message: "Multiple templates found" });
      return;
    }

    const templateId = templates[0].id;

    // 2. 기존 CodeChanges 목록 조회
    const [existingRows] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM TemplateCodeChanges WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    const existingIds = existingRows.map(row => row.id);  // 데이터베이스에 있는 애들
    const incomingIds = parsedCodeChanges.filter(row => !!row.id).map(row => row.id); // 업데이트 목록 중 id가 이미 있는 애들
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id)); // 데이터베이스에 있는 애들 중 업데이트 목록에서 없는 애들 -> 삭제 대상 

    // 3. 삭제 대상 soft-delete
    for (const id of idsToDelete) {
      await db.execute(
        `UPDATE TemplateCodeChanges SET deleted_at = NOW() WHERE id = ?`,
        [id]
      );
    }

    // 4. upsert
    for (const item of parsedCodeChanges) {
      const { id, ppt_no, aswas_code, tobe_code } = item;

      if (id) {
        await db.execute(
          `UPDATE TemplateCodeChanges SET ppt_no = ?, aswas_code = ?, tobe_code = ? WHERE id = ?`,
          [ppt_no, aswas_code, tobe_code, id]
        );
      } else {
        await db.execute<ResultSetHeader>(
          `INSERT INTO TemplateCodeChanges (ppt_no, aswas_code, tobe_code, template_id) VALUES (?, ?, ?, ?)`,
          [ppt_no, aswas_code, tobe_code, templateId]
        );
      }
    }

    await db.commit();
    res.status(200).json({ message: "Template updated successfully (upsert handled)" });

  } catch (err) {
    console.error("Template 수정 오류:", err);
    if (db) await db.rollback();
    res.status(500).json({ error: "Failed to update template" });
  }
};
