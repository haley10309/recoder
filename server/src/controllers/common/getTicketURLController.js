// Ticket URL 조회
const db = require("../../config/db");

exports.getTicketURLData = (req, res) => {
  const query = `
    SELECT ticket_url AS name
    FROM Templates
    WHERE deleted_at IS NULL
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching ticket url names:", err);
      return res.status(500).json({ error: "Failed to fetch ticket url" });
    }
    res.json(results);
  });
};