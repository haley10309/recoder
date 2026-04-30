import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";

import initDB from "../../config/initDB";
import { GetUnpackTemplateDetailsBody, GetUnpackTemplateDetailsResponse, UnpackRow } from "../../types/unpack.types";

export const getUnpackTemplateDetails = async (
  req: Request<{}, {}, GetUnpackTemplateDetailsBody>,
  res: Response<GetUnpackTemplateDetailsResponse>
): Promise<void> => {
  const { ticket_num, ticket_url } = req.body;

  try {
    const db = await initDB();

    // 1. template 조회
    const [templates] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates 
       WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    if (templates.length === 0) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }

    if (templates.length > 1) {
      res.status(409).json({ success: false, error: "Multiple templates found" });
      return;
    }

    const templateId = templates[0].id;

    // 2. unpack specs 조회
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT *
       FROM TemplateUnpackSpecs
       WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    // 3. 응답 구조 변환
    const row_list: UnpackRow[] = rows.map((row: any) => ({
      id: row.id,
      row_order: row.row_order ?? undefined,
      target_selector: row.target_selector,
      apply_type: row.apply_type,
      exclude_sup: Boolean(row.exclude_sup),
      enable_text_transform: Boolean(row.enable_text_transform),
      original_copy: row.original_copy ?? undefined,
      translated_copy: "", // 여기선 없음
    }));

    res.json({
      success: true,
      templateId,
      row_list,
    });

  } catch (err) {
    console.error("Error fetching unpack template details:", err);
    res.status(500).json({ success: false, error: "Failed to fetch unpack template details" });
  }
};