// 템플릿 세부 내용 조회

const db = require("../../config/db");
exports.getTemplateDetailsData = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const templateQuery = `
    SELECT id 
    FROM Templates
    WHERE ticket_num = ? AND ticket_url = ?
  `;

  db.query(templateQuery, [ticket_num, ticket_url], (err, results) => {
    if (err) {
      console.error("Error fetching template ID:", err);
      return res.status(500).json({ error: "Failed to fetch template details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    const templateId = results[0].id;

    const getCodeChangesQuery = `
      SELECT ppt_no, aswas_code, tobe_code
      FROM TemplateCodeChanges
      WHERE template_id = ?
    `;
    const getLocalizationEntriesQuery = `
      SELECT id, code_context
      FROM TemplateLocalizationEntries
      WHERE template_id = ?
    `;

    db.query(getCodeChangesQuery, [templateId], (err1, codeChanges) => {
      if (err1) {
        console.error("Error fetching TemplateCodeChanges:", err1);
        return res.status(500).json({ error: "Failed to fetch aswas_tobe_list" });
      }

      db.query(getLocalizationEntriesQuery, [templateId], (err2, localizationEntries) => {
        if (err2) {
          console.error("Error fetching TemplateLocalizationEntries:", err2);
          return res.status(500).json({ error: "Failed to fetch localization" });
        }

        res.json({
          templateId,
          codeChanges,
          localizationEntries,
        });
      });
    });
  });
};