// Ticket Number 조회
const db = require("../../config/db");
  
exports.getTicketNumData = (req, res) => {
const query = "SELECT DISTINCT ticket_num AS name FROM TemplateSetting";

db.query(query, (err, results) => {
    if (err) {
    console.error("Error fetching ticket number:", err);
    return res.status(500).json({ error: "Failed to fetch ticket number" });
    }
    res.json(results);
});
};