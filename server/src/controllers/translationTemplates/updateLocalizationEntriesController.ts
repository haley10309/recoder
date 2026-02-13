import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";

import initDB from "../../config/initDB";
import {
  UpdateLocalizationEntriesBody,
  UpdateLocalizationEntriesResponse,
  LocalizationEntryInput,
} from "../../types/codeTemplate.types";

export const updateLocalizationEntries = async (
  req: Request<{}, {}, UpdateLocalizationEntriesBody>,
  res: Response<UpdateLocalizationEntriesResponse>
): Promise<void> => {
  const { ticket_num, ticket_url, localization_entries = [], delete_ids = [] } = req.body; // localization_entries, delete_ids 기본값 []로 안전하게 설정

  if (!ticket_num || !ticket_url) {
    res.status(400).json({ success: false, message: "ticket_num and ticket_url are required." });
    return;
  }

  try {
    const db = await initDB();

    const [templates] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    if (templates.length === 0) {
      res.status(404).json({ success: false, message: "No such template." });
      return;
    }

    const templateId = templates[0].id;
    const insertItems = localization_entries.filter((item: LocalizationEntryInput) => !item.id);
    const updateItems = localization_entries.filter((item: LocalizationEntryInput) => !!item.id);

    // INSERT
    if (insertItems.length > 0) {
      const insertValues = insertItems.map((item: LocalizationEntryInput) => [item.code_context, templateId]);
      await db.query(`INSERT INTO TemplateLocalizationEntries (code_context, template_id) VALUES ?`, [insertValues]);
    }

    // UPDATE
    await Promise.all(
      updateItems.map((item: LocalizationEntryInput) =>
        db.execute(`UPDATE TemplateLocalizationEntries SET code_context = ? WHERE id = ?`, [item.code_context, item.id])
      )
    );

    // SOFT DELETE
    await Promise.all(
      delete_ids.map((deleteId: number) =>
        db.execute(`UPDATE TemplateLocalizationEntries SET deleted_at = NOW() WHERE id = ?`, [deleteId])
      )
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("Error processing localization:", err);
    res.status(500).json({ success: false, message: "DB error while processing localization." });
  }
};