   // 템플릿 세부 내용 조회
 const db = require("../../config/db");
  exports.templateData = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const query = `
    SELECT a.id, b.aswas_code, b.tobe_code , b.id, b.ppt_no
    FROM TemplateSetting a
    JOIN AsWasToBe b ON a.id = b.hotfix_id
    WHERE a.ticket_num = ? AND a.ticket_url = ?
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