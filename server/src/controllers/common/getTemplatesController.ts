// 템플릿 조회
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";

import initDB from "../../config/initDB";
import { GetTemplatesResponse, TemplateRow } from "../../types/codeTemplate.types";

export const getTemplates = async (
  req: Request,
  res: Response<GetTemplatesResponse>
): Promise<void> => {
  try {
    const db = await initDB();

    const [results] = await db.execute<RowDataPacket[]>(
      `SELECT id, ticket_num, ticket_url
      FROM Templates
      WHERE deleted_at IS NULL`
    );

    res.json(results as Pick<TemplateRow, "id" | "ticket_num" | "ticket_url">[]);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};
