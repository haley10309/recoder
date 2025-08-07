const initDB = require("../../config/initDB");

exports.putTemplatesByCountry = async (req, res) => {
  const templateId = req.body.templateId;
  const countryCode = req.body.countryCode;
  const codeChanges = JSON.parse(req.body.codeChanges);

  const db = await initDB();

  // create or get templateByCountryId
  let templateByCountryId;
  const [templatesByCountry] = await db.execute(
    `SELECT * FROM TemplatesByCountry WHERE template_id = ? AND country_code = ? AND deleted_at IS NULL`,
    [templateId, countryCode]
  );
  if (templatesByCountry.length >= 2) {
    return res.status(409).json({ error: "Multiple templatesByCountry found; expected exactly one" });
  } else if (templatesByCountry.length === 0) {
    const result = await db.execute(
      `INSERT INTO TemplatesByCountry (country_code, template_id) VALUES (?, ?)`,
      [countryCode, templateId]
    );
    templateByCountryId = result[0].insertId;
  } else {
    templateByCountryId = templatesByCountry[0].id;
  }
  
  // get codeChanges
  const [templateCodeChangesByCountry_beforeUpdate] = await db.execute(
    `SELECT id, ppt_no, aswas_code, tobe_code, localized_tobe_code FROM TemplateCodeChangesByCountry WHERE template_by_country_id = ? AND deleted_at IS NULL`,
    [templateByCountryId]
  );

  // delete codeChanges
  const codeChangesToDelete = templateCodeChangesByCountry_beforeUpdate.filter(beforeItem =>
    !codeChanges.some(afterItem => afterItem.id === beforeItem.id)
  );
  for (const item of codeChangesToDelete) {
    await db.execute(
      `UPDATE TemplateCodeChangesByCountry SET deleted_at = NOW() WHERE id = ?`,
      [item.id]
    );
  }

  // insert codeChanges
  const codeChangesToInsert = codeChanges.filter((item) => !item.id);
  if (codeChangesToInsert.length > 0) {
    const valuesToInsert = codeChangesToInsert.map((item) => {
      return [
        templateByCountryId,
        item.pptNo,
        item.asWasCode,
        item.toBeCode,
        item.localizedToBeCode || '',
      ];
    });
    await db.query(
      `INSERT INTO TemplateCodeChangesByCountry (template_by_country_id, ppt_no, aswas_code, tobe_code, localized_tobe_code) VALUES ?`,
      [valuesToInsert]
    );
  }
  
  // update codeChanges
  const codeChangesToUpdate = codeChanges.filter((item) => !!item.id);
  for (const item of codeChangesToUpdate) {
    await db.execute(
      `UPDATE TemplateCodeChangesByCountry SET ppt_no = ?, aswas_code = ?, tobe_code = ?, localized_tobe_code = ? WHERE id = ?`,
      [item.pptNo, item.asWasCode, item.toBeCode, item.localizedToBeCode || '', item.id]
    );
  }

  console.log(`
    <putTemplatesByCountry log>
    codeChangesToDelete: ${codeChangesToDelete.length}개 ${codeChangesToDelete.map(item => item.id).toString()}
    codeChangesToInsert: ${codeChangesToInsert.length}개 ${codeChangesToInsert.map(item => item.id).toString()}
    codeChangesToUpdate: ${codeChangesToUpdate.length}개 ${codeChangesToUpdate.map(item => item.id).toString()}  
  `);
  
  // get codeChanges
  const [templateCodeChangesByCountry_afterUpdate] = await db.execute(
    `SELECT id, ppt_no, aswas_code, tobe_code, localized_tobe_code FROM TemplateCodeChangesByCountry WHERE template_by_country_id = ? AND deleted_at IS NULL`,
    [templateByCountryId]
  );

  return res.json({
    templateByCountryId,
    templateCodeChangesByCountry: templateCodeChangesByCountry_afterUpdate,
  });
};

exports.deleteTemplatesByCountry = async (req, res) => {
  const templateByCountryId = req.body.templateByCountryId;

  const db = await initDB();
  await db.execute(
    `UPDATE TemplatesByCountry SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    [templateByCountryId]
  );
  // TemplateCodeChangesByCountry는 따로 안지움. 어차피 딸려나올 때 templateByCountry가 삭제되었으므로 같이 필터링됨

  return res.json({
    isDeleted: true,
  });
};
