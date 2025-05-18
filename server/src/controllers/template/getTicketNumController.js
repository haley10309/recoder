// Ticket Number 조회
const db = require("../../config/db");
  
exports.getTicketNumData = (req, res) => {
    const query = `
        SELECT DISTINCT ticket_num AS name
        FROM Templates
        WHERE deleted_at IS NULL
    `;

    db.query(query, (err, results) => {
        if (err) {
        console.error("Error fetching ticket number:", err);
        return res.status(500).json({ error: "Failed to fetch ticket number" });
        }
        res.json(results);
    });
};