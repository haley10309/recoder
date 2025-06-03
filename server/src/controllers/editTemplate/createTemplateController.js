// 템플릿 생성
const db = require("../../config/db");

// TODO: update-template이랑 합치기

exports.createTemplateData = (req, res) => {
    const { ticket_num, ticket_url, code_changes } = req.body;

    if (!code_changes) {
      return res.status(400).json({ error: "code_changes가 없습니다." });
    }

    let parsedCodeChanges;
    try {
      parsedCodeChanges = JSON.parse(code_changes);
    } catch (err) {
      return res.status(400).json({ error: "Invalid codeChanges format" });
    }

    const createTemplateQuery =
      "INSERT INTO Templates (ticket_num, ticket_url) VALUES (?, ?)";
    db.query(
      createTemplateQuery,
      [ticket_num, ticket_url],
      (err, result) => {
        if (err) {
          console.error("Template 저장 오류:", err);
          return res.status(500).json({ error: "Template 저장 실패" });
        }

        const templateId = result.insertId;

        const createCodeChangeQuery =
          "INSERT INTO TemplateCodeChanges (ppt_no, aswas_code, tobe_code, template_id) VALUES ?";

        const createCodeChangeQueryData = parsedCodeChanges.map((item) => [
          item.ppt_no,
          item.aswas_code,
          item.tobe_code,
          templateId,
        ]);

        db.query(createCodeChangeQuery, [createCodeChangeQueryData], (err) => {
          if (err) {
            console.error("CodeChanges 저장 오류:", err);
            return res.status(500).json({ error: "CodeChanges 저장 실패" });
          }

          res.json({
            message: "Template과 TemplateCodeChange가 성공적으로 저장되었습니다.",
          });
        });
      }
    );
};