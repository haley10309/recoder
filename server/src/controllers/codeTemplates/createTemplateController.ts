// 템플릿 생성
import initDB from "../../config/initDB";

export const createTemplateData = async (req: any, res: any) => {
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

  try {
    const db = await initDB();

    const [result] = await db.execute(
      "INSERT INTO Templates (ticket_num, ticket_url) VALUES (?, ?)",
      [ticket_num, ticket_url]
    );

    const templateId = result.insertId;

    const createCodeChangeQuery =
      "INSERT INTO TemplateCodeChanges (ppt_no, aswas_code, tobe_code, template_id) VALUES ?";

    const createCodeChangeQueryData = parsedCodeChanges.map((item: any) => [
      item.ppt_no,
      item.aswas_code,
      item.tobe_code,
      templateId,
    ]);

    await db.query(createCodeChangeQuery, [createCodeChangeQueryData]);

    res.json({
      message: "Template과 TemplateCodeChange가 성공적으로 저장되었습니다.",
    });
  } catch (err) {
    console.error("Template 저장 오류:", err);
    return res.status(500).json({ error: "Template 저장 실패" });
  }
};
