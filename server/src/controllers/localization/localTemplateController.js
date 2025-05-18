// 번역 템플릿 삽입, 삭제, 수정
const db = require("../../config/db");

exports.updateLocalizationFull = (req, res) => {
  const { ticket_num, ticket_url, localizationEntries = [], delete_ids = [] } = req.body; // localizationEntries, delete_ids 기본값 []로 안전하게 설정

  if (!ticket_num || !ticket_url) {
    return res.status(400).json({ success: false, message: "ticket_num and ticket_url are required." });
  }

  const findTemplateQuery = `
    SELECT id
    FROM Templates
    WHERE ticket_num = ? AND ticket_url = ?
  `;

  db.query(findTemplateQuery, [ticket_num, ticket_url], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ success: false, message: "No such template." });
    }

    const templateId = results[0].id;
    const insertItems = localizationEntries.filter(item => !item.id);
    const updateItems = localizationEntries.filter(item => !!item.id);

    const insertValues = insertItems.map(item => [item.code_context, templateId]);
    const insertQuery = `INSERT INTO TemplateLocalizationEntries (code_context, template_id) VALUES ?`;
    const updateQuery = `UPDATE TemplateLocalizationEntries SET code_context = ? WHERE id = ? AND template_id = ?`;
    const deleteQuery = `DELETE FROM TemplateLocalizationEntries WHERE id IN (?) AND template_id = ?`;

    const updatePromises = updateItems.map(item => {
      return new Promise((resolve, reject) => {
        db.query(updateQuery, [item.code_context, item.id, templateId], err => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    const insertPromise = insertItems.length > 0
      ? new Promise((resolve, reject) => {
          db.query(insertQuery, [insertValues], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows);
          });
        })
      : Promise.resolve(0);

    const deletePromise = delete_ids.length > 0
      ? new Promise((resolve, reject) => {
          db.query(deleteQuery, [delete_ids, hotfix_id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows);
          });
        })
      : Promise.resolve(0);

    Promise.all([
      insertPromise,
      ...updatePromises,
      deletePromise
    ])
      .then(([inserted, ...rest]) => {
        const deleted = rest.pop(); 
        const updated = rest.length;
        res.json({
          success: true,
          inserted,
          updated,
          deleted
        });
      })
      .catch(err => {
        console.error("Error processing localization:", err);
        res.status(500).json({ success: false, message: "DB error while processing localization." });
      });
  });
};
