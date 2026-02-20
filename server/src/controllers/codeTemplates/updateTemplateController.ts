// 템플릿 수정 (기존 값은 update, 새 값은 insert, 사라진 건 delete)
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";

import initDB from "../../config/initDB";
import { CodeChangeWithId, UpdateTemplateBody, UpdateTemplateResponse, VariationWithId } from "../../types/codeTemplate.types";

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
    const [existingCodeChangeRows] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM TemplateCodeChanges WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );
    const existingIds = existingCodeChangeRows.map(row => row.id);  // 데이터베이스에 있는 애들
    const incomingIds = parsedCodeChanges.filter(row => !!row.id).map(row => row.id); // 업데이트 목록 중 id가 이미 있는 애들
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id)); // 데이터베이스에 있는 애들 중 업데이트 목록에서 없는 애들 -> 삭제 대상 

    // 3. 삭제 대상 CodeChanges soft-delete
    for (const id of idsToDelete) {
      await db.execute(
        `UPDATE TemplateCodeChanges SET deleted_at = NOW() WHERE id = ?`,
        [id]
      );
    }

    // 4. CodeChanges upsert + Variations/Countries 처리
    for (const item of parsedCodeChanges) {
      const { id, ppt_no, aswas_code, tobe_code, variations } = item;
      let codeChangeId: number;

      if (id) {
        // UPDATE
        await db.execute(
          `UPDATE TemplateCodeChanges SET ppt_no = ?, aswas_code = ?, tobe_code = ? WHERE id = ?`,
          [ppt_no, aswas_code, tobe_code, id]
        );
        codeChangeId = id;
      } else {
        // INSERT
        const [insertResult] = await db.execute<ResultSetHeader>(
          `INSERT INTO TemplateCodeChanges (ppt_no, aswas_code, tobe_code, template_id) VALUES (?, ?, ?, ?)`,
          [ppt_no, aswas_code, tobe_code, templateId]
        );
        codeChangeId = insertResult.insertId;
      }

      // 5. 기존 Variations 목록 조회
      const [existingVariationRows] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM TemplateCodeChangeVariations WHERE code_change_id = ? AND deleted_at IS NULL`,
        [codeChangeId]
      );
      const existingVariationIds = existingVariationRows.map(row => row.id);
      const incomingVariationIds = (variations ?? []).filter(v => !!v.id).map(v => v.id);
      const variationIdsToDelete = existingVariationIds.filter(vid => !incomingVariationIds.includes(vid));

      // 6. 삭제 대상 Variations soft-delete
      for (const vid of variationIdsToDelete) {
        await db.execute(
          `UPDATE TemplateCodeChangeVariations SET deleted_at = NOW() WHERE id = ?`,
          [vid]
        );
      }

      // 7. Variations upsert + Countries 처리
      for (const variation of (variations ?? [])) {
        const { id: variationId, aswas_code_variation, tobe_code_variation, description, countries } = variation as VariationWithId;
        let resolvedVariationId: number;

        if (variationId) {
          // UPDATE
          await db.execute(
            `UPDATE TemplateCodeChangeVariations SET aswas_code_variation = ?, tobe_code_variation = ?, description = ? WHERE id = ?`,
            [aswas_code_variation, tobe_code_variation ?? null, description ?? null, variationId]
          );
          resolvedVariationId = variationId;
        } else {
          // INSERT
          const [variationResult] = await db.execute<ResultSetHeader>(
            `INSERT INTO TemplateCodeChangeVariations (code_change_id, aswas_code_variation, tobe_code_variation, description) VALUES (?, ?, ?, ?)`,
            [codeChangeId, aswas_code_variation, tobe_code_variation ?? null, description ?? null]
          );
          resolvedVariationId = variationResult.insertId;
        }

        // 8. Countries 전체 교체 (DELETE → bulk INSERT)
        await db.execute(
          `DELETE FROM TemplateCodeChangeVariationCountries WHERE variation_id = ?`,
          [resolvedVariationId]
        );
        if (countries && countries.length > 0) {
          const countriesData = countries.map(countryCode => [resolvedVariationId, countryCode]);
          await db.query<ResultSetHeader>(
            `INSERT INTO TemplateCodeChangeVariationCountries (variation_id, country_code) VALUES ?`,
            [countriesData]
          );
        }
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