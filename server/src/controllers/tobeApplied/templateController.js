// 템플릿 세부 내용 조회
const db = require("../../config/db");
exports.templateData = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const query = `
    SELECT template.id, templateCodeChange.aswas_code, templateCodeChange.tobe_code , templateCodeChange.id, templateCodeChange.ppt_no
    FROM Templates template
    JOIN TemplateCodeChanges templateCodeChange ON template.id = templateCodeChange.template_id
    WHERE template.ticket_num = ? AND template.ticket_url = ?
  `;
  
  db.query(query, [ticket_num, ticket_url], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ success: false, message: 'Database query error' });
    }
    
    if (results.length === 0) {
      return res.json({ success: false, codePairs: []});
    } else {
      return res.json({ success: true, codePairs: results});
    }

  });
  };