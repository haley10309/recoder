// 템플릿 세부 내용 조회
const db = require("../../config/db");
exports.templateData = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const findTemplateQuery = `
    SELECT t.id
    FROM Templates t
    WHERE t.ticket_num = ? AND t.ticket_url = ? AND t.deleted_at IS NULL
  `;
  db.query(findTemplateQuery, [ticket_num, ticket_url], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ message: 'Database query error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    const templateId = results[0].id;

    const getCodeChangesQuery = `
      SELECT t.id template_id, tcc.aswas_code, tcc.tobe_code , tcc.id code_change_id, tcc.ppt_no
      FROM Templates t
      JOIN TemplateCodeChanges tcc ON t.id = tcc.template_id
      WHERE t.id = ? AND t.deleted_at IS NULL AND tcc.deleted_at IS NULL
    `;
    db.query(getCodeChangesQuery, [templateId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ message: 'Database query error' });
      }
      
      return res.json({
        template_id: templateId,
        code_changes: results,
      });
    });
  });
};