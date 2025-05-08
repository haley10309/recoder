// 템플릿 수정 (기존 값은 update, 새 값은 insert, 사라진 건 delete)

const db = require("../../config/db");

exports.updateTemplateData = async (req, res) => {
  try {
    const { templateId, ticket_num, ticket_url, aswas_tobe_list } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: "templateId is required for updating." });
    }

    let parsedAsWasToBeList;
    try {
      parsedAsWasToBeList = JSON.parse(aswas_tobe_list);
    } catch (error) {
      return res.status(400).json({ error: "Invalid format for aswas_tobe_list" });
    }

    // 1. TemplateSetting 정보 업데이트
    const updateTemplateQuery = `
      UPDATE TemplateSetting 
      SET ticket_num = ?, ticket_url = ?
      WHERE id = ?`;

    db.query(updateTemplateQuery, [ticket_num, ticket_url, templateId], (err) => {
      if (err) {
        console.error("Error updating template:", err);
        return res.status(500).json({ error: "Failed to update template" });
      }

      // 2. 기존 AsWasToBe ID 목록 조회
      const getExistingIdsQuery = `SELECT id FROM AsWasToBe WHERE hotfix_id = ?`;
      db.query(getExistingIdsQuery, [templateId], (err, existingRows) => {
        if (err) {
          console.error("Error fetching existing IDs:", err);
          return res.status(500).json({ error: "Failed to fetch existing entries" });
        }

        const existingIds = existingRows.map(row => row.id);
        const incomingIds = parsedAsWasToBeList.filter(row => row.id).map(row => row.id);
        const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

        // 3. 삭제 대상 처리
        const deletePromises = idsToDelete.map(id => {
          return new Promise((resolve, reject) => {
            db.query(`DELETE FROM AsWasToBe WHERE id = ?`, [id], (err) => {
              if (err) {
                console.error("Error deleting row:", err);
                return reject(err);
              }
              resolve();
            });
          });
        });

        // 4. 삽입 및 수정 처리
        const upsertPromises = parsedAsWasToBeList.map(item => {
          const { id, ppt_no, aswas_code, tobe_code } = item;

          return new Promise((resolve, reject) => {
            if (id) {
              // UPDATE
              const updateQuery = `
                UPDATE AsWasToBe
                SET ppt_no = ?, aswas_code = ?, tobe_code = ?
                WHERE id = ?`;
              db.query(updateQuery, [ppt_no, aswas_code, tobe_code, id], (err) => {
                if (err) {
                  console.error("Error updating row:", err);
                  return reject(err);
                }
                resolve();
              });
            } else {
              // INSERT
              const insertQuery = `
                INSERT INTO AsWasToBe (ppt_no, aswas_code, tobe_code, hotfix_id)
                VALUES (?, ?, ?, ?)`;
              db.query(insertQuery, [ppt_no, aswas_code, tobe_code, templateId], (err) => {
                if (err) {
                  console.error("Error inserting row:", err);
                  return reject(err);
                }
                resolve();
              });
            }
          });
        });

        // 5. 모두 실행
        Promise.all([...deletePromises, ...upsertPromises])
          .then(() => {
            res.status(200).json({ message: "Template updated successfully (upsert handled)" });
          })
          .catch((err) => {
            console.error("Error processing entries:", err);
            res.status(500).json({ error: "Failed to update entries" });
          });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
