// 템플릿 생성
import { Request, Response } from "express";
import initDB from "../../config/initDB";
import { ResultSetHeader } from "mysql2";
import { Connection } from "mysql2/promise";

interface CreateTemplateBody {
  ticket_num: string;
  ticket_url: string;
  code_changes: string; // stringified된 code_changes 문자열
}
interface Variation {
  aswas_code_variation: string;
  tobe_code_variation?: string;
  description?: string;
  countries?: string[];
}
interface CodeChange {
  ppt_no: string;
  aswas_code: string;
  tobe_code: string;
  variations?: Variation[];
}

export const createTemplateData = async (
  req: Request<{}, {}, CreateTemplateBody>,
  res: Response  
) => {
  const { ticket_num, ticket_url, code_changes } = req.body;

  if (!code_changes) {
    return res.status(400).json({ error: "code_changes가 없습니다." });
  }

  let parsedCodeChanges: CodeChange[];
  try {
    parsedCodeChanges = JSON.parse(code_changes);
  } catch (err) {
    return res.status(400).json({ error: "Invalid codeChanges format" });
  }

  // INSERT 순서: Templates → CodeChanges → Variations → Countries (FK 의존 순서)

  let db: Connection | undefined;
  try {
    db = await initDB();
    await db.beginTransaction();

    // 1. Templates INSERT
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO Templates (ticket_num, ticket_url) VALUES (?, ?)",
      [ticket_num, ticket_url]
    );

    const templateId = result.insertId;

    // 2. CodeChanges → Variations → Countries 순차 INSERT
    for (const change of parsedCodeChanges) {
      const [codeChangeResult] = await db.execute<ResultSetHeader>(
        "INSERT INTO TemplateCodeChanges (ppt_no, aswas_code, tobe_code, template_id) VALUES (?, ?, ?, ?)",
        [change.ppt_no, change.aswas_code, change.tobe_code, templateId]
      );

      const codeChangeId = codeChangeResult.insertId;

      // 3. Variations INSERT
      if (change.variations && change.variations.length > 0) {
        for (const variation of change.variations) {
          const [variationResult] = await db.execute<ResultSetHeader>(
            "INSERT INTO TemplateCodeChangeVariations (code_change_id, aswas_code_variation, tobe_code_variation, description) VALUES (?, ?, ?, ?)",
            [
              codeChangeId,
              variation.aswas_code_variation,
              variation.tobe_code_variation,
              variation.description || null,
            ]
          );

          const variationId = variationResult.insertId;

          // 4. VariationCountries INSERT (bulk)
          if (variation.countries && variation.countries.length > 0) {
            const countriesData = variation.countries.map((countryCode: string) => [
              variationId,
              countryCode,
            ]);
            await db.query<ResultSetHeader>(
              "INSERT INTO TemplateCodeChangeVariationCountries (variation_id, country_code) VALUES ?",
              [countriesData]
            );
          }
        }
      }
    }

    await db.commit();

    res.json({
      message: "Template, CodeChanges, Variations, Countries가 성공적으로 저장되었습니다.",
    });
  } catch (err) {
    console.error("Template 저장 오류:", err);
    if (db) await db.rollback();
    return res.status(500).json({ error: "Template 저장 실패" });
  }

};
