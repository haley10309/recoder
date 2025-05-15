// 번역 템플릿 삽입, 삭제, 수정
const db = require("../../config/db");

exports.updateLocalizationFull = (req, res) => {
  const { ticket_num, ticket_url, localization_list = [], delete_ids = [] } = req.body; // localization_list, delete_ids 기본값 []로 안전하게 설정정

  if (!ticket_num || !ticket_url) {
    return res.status(400).json({ success: false, message: "ticket_num and ticket_url are required." });
  }
  const findTemplateQuery = `SELECT id FROM TemplateSetting WHERE ticket_num = ? AND ticket_url = ?`;
  db.query(findTemplateQuery, [ticket_num, ticket_url], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ success: false, message: "No such template." });
    }

    // TODO: id 관리... 아예 체계적으로 해야됨. 애초에 템플릿 불러올 때부터. -> localization의 id 관리 기준을 알아야 됨.
    // TODO: 있는건 있는대로, 없으면 auto increase 되도록?
    const hotfix_id = results[0].id;
    const insertItems = localization_list.filter(item => !item.id);
    const updateItems = localization_list.filter(item => item.id);

    const insertValues = insertItems.map(item => [item.local_code, hotfix_id]);
    const insertQuery = `INSERT INTO localization (local_code, hotfix_id) VALUES ?`;
    const updateQuery = `UPDATE localization SET local_code = ? WHERE id = ? AND hotfix_id = ?`;
    const deleteQuery = `DELETE FROM localization WHERE id IN (?) AND hotfix_id = ?`;

    const updatePromises = updateItems.map(item => {
      return new Promise((resolve, reject) => {
        db.query(updateQuery, [item.local_code, item.id, hotfix_id], err => {
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
