// 템플릿 조회
const db = require("../../config/db");

exports.getTemplates = (req, res) => {
  const query = `
    SELECT id, ticket_num, ticket_url
    FROM Templates
    WHERE deleted_at IS NULL
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching templates:", err);
      return res.status(500).json({ error: "Failed to fetch templates" });
    }
    res.json(results);
  });
};
