// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

// 템플릿 생성 시, 템플릿이 존재하는지 확인

import db from "../../config/db";

export const checkTemplateData = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const query = `
    SELECT * FROM Templates 
    WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL
  `;

  db.query(
    query,
    [ticket_num, ticket_url],
    (err, results) => {
      if (err) {
        console.error("Error fetching templates:", err);
        return res.status(500).json({ error: "Failed to fetch templates" });
      }
      const isTemplateExist = results.length > 0;
      res.json({
        isTemplateExist,
      });
    }
  );
};