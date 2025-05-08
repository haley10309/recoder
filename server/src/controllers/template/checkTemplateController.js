// 템플릿 생성 시, 템플릿이 존재하는지 확인

const db = require("../../config/db");

exports.checkTemplateData = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const query = `
    SELECT * FROM TemplateSetting 
    WHERE ticket_num = ? AND ticket_url = ?
  `;

  db.query(
    query,
    [ticket_num, ticket_url],
    (err, results) => {
      if (err) {
        console.error("Error fetching templates:", err);
        return res.status(500).json({ error: "Failed to fetch templates" });
      }
      res.json(results);
    }
  );
};