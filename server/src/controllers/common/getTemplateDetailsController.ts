// 템플릿 세부 내용 조회
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";

import initDB from "../../config/initDB";
import {
  GetTemplateDetailsBody,
  GetTemplateDetailsResponse,
  TemplateCodeChangeRow,
  TemplateLocalizationEntryRow,
  TemplateVariationRow,
} from "../../types/codeTemplate.types";

export const getTemplateDetailsData = async (
  req: Request<{}, {}, GetTemplateDetailsBody>,
  res: Response<GetTemplateDetailsResponse>
): Promise<void> => {
  const { ticket_num, ticket_url } = req.body;

  try {
    const db = await initDB();

    const [templates] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    if (templates.length === 0) {
      console.error("Error fetching template ID: results=0");
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const templateId = templates[0].id;

    const [codeChanges] = await db.execute<RowDataPacket[]>(
      `SELECT id, ppt_no, aswas_code, tobe_code FROM TemplateCodeChanges WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );
    // codeChanges 루프
    for (const change of codeChanges) {
      const [variations] = await db.execute<RowDataPacket[]>(
        `SELECT id, aswas_code_variation, tobe_code_variation, description
        FROM TemplateCodeChangeVariations
        WHERE code_change_id = ? AND deleted_at IS NULL`,
        [change.id]
      );

      for (const variation of variations) {
        const [countries] = await db.execute<RowDataPacket[]>(
          `SELECT country_code FROM TemplateCodeChangeVariationCountries WHERE variation_id = ?`,
          [variation.id]
        );
        variation.countries = countries.map((c: any) => c.country_code);
      }

      change.variations = variations as TemplateVariationRow[];
    }

    console.log("change", JSON.stringify(codeChanges))

    const [localizationEntries] = await db.execute<RowDataPacket[]>(
      `SELECT id, code_context FROM TemplateLocalizationEntries WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    res.json({
      templateId,
      codeChanges: codeChanges as TemplateCodeChangeRow[],
      localizationEntries:  localizationEntries as TemplateLocalizationEntryRow[],
    });
  } catch (err) {
    console.error("Error fetching template details:", err);
    res.status(500).json({ error: "Failed to fetch template details" });
  }
};
