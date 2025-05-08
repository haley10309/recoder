// 템플릿 생성

const db = require("../../config/db");

exports.createTemplateData = (req, res) => {
    const { templateId, ticket_num, ticket_url, create_date, aswas_tobe_list } = req.body;

    if (!aswas_tobe_list) {
      return res.status(400).json({ error: "aswas_tobe_list가 없습니다." });
    }

    let parsedAsWasTobeList;
    try {
      parsedAsWasTobeList = JSON.parse(aswas_tobe_list);
    } catch (err) {
      return res.status(400).json({ error: "Invalid aswas_tobe_list format" });
    }

    const templateQuery =
      "INSERT INTO TemplateSetting (ticket_num, ticket_url, create_date) VALUES (?, ?, NOW())";
    db.query(
      templateQuery,
      [ticket_num, ticket_url],
      (err, templateResult) => {
        if (err) {
          console.error("TemplateSetting 저장 오류:", err);
          return res.status(500).json({ error: "TemplateSetting 저장 실패" });
        }

        const hotfixId = templateResult.insertId;

        const asWasTobeQuery =
          "INSERT INTO AsWasToBe (ppt_no, aswas_code, tobe_code, hotfix_id) VALUES ?";

        const asWasTobeData = parsedAsWasTobeList.map((item) => [
          item.ppt_no,
          item.aswas_code,
          item.tobe_code,
          hotfixId,
        ]);

        db.query(asWasTobeQuery, [asWasTobeData], (err) => {
          if (err) {
            console.error("AsWasToBe 저장 오류:", err);
            return res.status(500).json({ error: "AsWasToBe 저장 실패" });
          }

          res.json({
            message: "TemplateSetting과 AsWasToBe가 성공적으로 저장되었습니다.",
          });
        });
      }
    );
};