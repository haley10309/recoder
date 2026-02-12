// 템플릿 세부 내용 조회
import initDB from "../../config/initDB";

export const getTemplateDetailsData = async (req: any, res: any) => {
  const { ticket_num, ticket_url } = req.body;

  try {
    const db = await initDB();

    const [templates] = await db.execute(
      `SELECT id FROM Templates WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
      [ticket_num, ticket_url]
    );

    if (templates.length === 0) {
      console.error("Error fetching template ID: results=0");
      return res.status(404).json({ error: "Template not found" });
    }

    const templateId = templates[0].id;

    const [codeChanges] = await db.execute(
      `SELECT id, ppt_no, aswas_code, tobe_code FROM TemplateCodeChanges WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    const [localizationEntries] = await db.execute(
      `SELECT id, code_context FROM TemplateLocalizationEntries WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    res.json({
      templateId,
      codeChanges,
      localizationEntries,
    });
  } catch (err) {
    console.error("Error fetching template details:", err);
    return res.status(500).json({ error: "Failed to fetch template details" });
  }
};
