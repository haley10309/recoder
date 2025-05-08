// 로컬라이제이션 템플릿 세부 내용 조회

const db = require("../../config/db");
exports.getlocalDetails = (req, res) => {
  const { ticket_num, ticket_url } = req.body;

  const templateQuery = `
    SELECT ts.id 
    FROM TemplateSetting ts 
    WHERE ts.ticket_num = ? AND ts.ticket_url = ?`;

  db.query(templateQuery, [ticket_num, ticket_url], (err, results) => {
    if (err) {
      console.error("Error fetching template ID:", err);
      return res.status(500).json({ error: "Failed to fetch template details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    const templateId = results[0].id;

    const localizationQuery = `
      SELECT id, local_code
      FROM localization
      WHERE hotfix_id = ?`;
  
        db.query(localizationQuery, [templateId], (err1, localizationResults) => {
          if (err1) {
            console.error("Error fetching Localization:", err1);
            return res.status(500).json({ error: "Failed to fetch localization" });
          }
  
          res.json({
            templateId,
            localization_list: localizationResults
          });
        });
      });
    };