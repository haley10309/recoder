// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

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
