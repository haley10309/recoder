// 템플릿 생성 시, 템플릿이 존재하는지 확인

import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";

import { CheckTemplateBody, CheckTemplatesResponse } from "../../types/codeTemplate.types";
import initDB from "../../config/initDB";

export const checkTemplateExist = async (
  req: Request<{}, {}, CheckTemplateBody>,
  res: Response<CheckTemplatesResponse>
): Promise<void> => {
  try {
  const { ticket_num, ticket_url } = req.body;

    const db = await initDB();
    
    const [results] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM Templates 
      WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    const isTemplateExist = results.length > 0;
    res.json({
      isTemplateExist,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};