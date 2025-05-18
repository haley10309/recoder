// 템플릿 수정 (기존 값은 update, 새 값은 insert, 사라진 건 delete)

const db = require("../../config/db");

exports.updateTemplateData = async (req, res) => {
  try {
    const { template_id, code_changes } = req.body;

    if (!template_id) {
      return res.status(400).json({ error: "template_id is required for updating." });
    }

    let parsedCodeChanges;
    try {
      parsedCodeChanges = JSON.parse(code_changes);
    } catch (error) {
      return res.status(400).json({ error: "Invalid format for code_changes" });
    }

    // 기존 TemplateCodeChanges 목록 조회
    const getExistingRowsQuery = `SELECT id FROM TemplateCodeChanges WHERE template_id = ? AND deleted_at IS NULL`;
    db.query(getExistingRowsQuery, [template_id], (err, existingRows) => {
      if (err) {
        console.error("Error fetching existing IDs:", err);
        return res.status(500).json({ error: "Failed to fetch existing entries" });
      }

      const existingIds = existingRows.map(row => row.id);  // 데이터베이스에 있는 애들
      const incomingIds = parsedCodeChanges.filter(row => !!row.id).map(row => row.id); // 업데이트 목록 중 id가 이미 있는 애들
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id)); // 데이터베이스에 있는 애들 중 업데이트 목록에서 없는 애들 -> 삭제 대상 

      // 삭제 대상 처리
      const deletePromises = idsToDelete.map(id => {
        return new Promise((resolve, reject) => {
          db.query(`UPDATE TemplateCodeChanges SET deleted_at = NOW() WHERE id = ?`, [id], (err) => {
            if (err) {
              console.error("Error deleting row:", err);
              return reject(err);
            }
            resolve();
          });
        });
      });

      // 삽입 및 수정 처리
      const upsertPromises = parsedCodeChanges.map(item => {
        const { id, ppt_no, aswas_code, tobe_code } = item;

        return new Promise((resolve, reject) => {
          if (id) {
            // UPDATE
            const updateQuery = `
              UPDATE TemplateCodeChanges
              SET ppt_no = ?, aswas_code = ?, tobe_code = ?
              WHERE id = ?
            `;
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
              INSERT INTO TemplateCodeChanges (ppt_no, aswas_code, tobe_code, template_id)
              VALUES (?, ?, ?, ?)
            `;
            db.query(insertQuery, [ppt_no, aswas_code, tobe_code, template_id], (err) => {
              if (err) {
                console.error("Error inserting row:", err);
                return reject(err);
              }
              resolve();
            });
          }
        });
      });

      // Promises 모두 실행
      Promise.all([...deletePromises, ...upsertPromises])
        .then(() => {
          res.status(200).json({ message: "Template updated successfully (upsert handled)" });
        })
        .catch((err) => {
          console.error("Error processing entries:", err);
          res.status(500).json({ error: "Failed to update entries" });
        });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
