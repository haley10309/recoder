// ticket_num과 ticket_url로 해당 템플릿의 ppt_no, tobe_code 목록 조회

const db = require("../../config/db");

exports.getTobeCodeByTicket = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  if (!ticket_num || !ticket_url) {
    return res.status(400).json({ error: "ticket_num and ticket_url are required." });
  }

  // 1. 템플릿 ID 조회
  const getTemplateIdQuery = `
    SELECT id FROM TemplateSetting
    WHERE ticket_num = ? AND ticket_url = ?
  `;

  db.query(getTemplateIdQuery, [ticket_num, ticket_url], (err, results) => {
    if (err) {
      console.error("Error querying TemplateSetting:", err);
      return res.status(500).json({ error: "Failed to find template." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Template not found." });
    }

    const templateId = results[0].id;

    // 2. 연결된 ppt_no, tobe_code 조회
    const getTobeCodesQuery = `
      SELECT ppt_no, tobe_code
      FROM AsWasToBe
      WHERE hotfix_id = ?
    `; // hotfix_id = TemplateSetting.id

    db.query(getTobeCodesQuery, [templateId], (err, rows) => {
      if (err) {
        console.error("Error fetching tobe_code list:", err);
        return res.status(500).json({ error: "Failed to fetch tobe_code list." });
      }

      res.status(200).json({
        templateId,
        tobe_code_list: rows,
      });
    });
  });
};
