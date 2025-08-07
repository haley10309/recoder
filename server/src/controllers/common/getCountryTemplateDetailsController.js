const initDB = require("../../config/initDB");

exports.getCountryTemplateDetailsData = async (req, res) => {
  const { ticket_num, ticket_url, country_code } = req.body;

  const db = await initDB();
  
  const [templates] = await db.execute(
    `SELECT * FROM Templates WHERE ticket_num = ? AND ticket_url = ? AND deleted_at IS NULL`,
    [ticket_num, ticket_url]
  );

  if (templates.length === 0) {
    return res.status(404).json({ error: "Template Not Found" });
  }
  if (templates.length >= 2) {
    return res.status(409).json({ error: "Multiple templates found; expected exactly one" });
  }

  const templateId = templates[0].id;
  
  const [templatesByCountry] = await db.execute(
    `SELECT * FROM TemplatesByCountry WHERE template_id = ? AND country_code = ? AND deleted_at IS NULL`,
    [templateId, country_code]
  );
  if (templatesByCountry.length >= 2) {
    return res.status(409).json({ error: "Multiple templates found; expected exactly one" });
  }

  if (templatesByCountry.length === 0) {
    // 국가별 템플릿 아직 없으면, templateCodeChanges 반환
    const [templateCodeChanges] = await db.execute(
      // TemplateCodeChanges의 id는 Template Mapping 페이지에서 필요없음
      `SELECT ppt_no, aswas_code, tobe_code FROM TemplateCodeChanges WHERE template_id = ? AND deleted_at IS NULL`,
      [templateId]
    );

    return res.json({ 
      codeChanges: templateCodeChanges,
      templateId,
      country_code,
    });
  }

  // 국가별 템플릿 존재
  const templateByCountryId = templatesByCountry[0].id;
  const [templateCodeChangesByCountry] = await db.execute(
    `SELECT id, ppt_no, aswas_code, tobe_code, localized_tobe_code FROM TemplateCodeChangesByCountry WHERE template_by_country_id = ? AND deleted_at IS NULL`,
    [templateByCountryId]
  );

  // 국가별 codeChanges 있으므로, templateCodeChanges 반환
  return res.json({ 
    codeChanges: templateCodeChangesByCountry,
    templateId,
    templateByCountryId,
    country_code,
  });
};
