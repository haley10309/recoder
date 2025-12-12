// 템플릿 조회
import db from "../../config/db";

export const getTemplates = (req, res) => {
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
