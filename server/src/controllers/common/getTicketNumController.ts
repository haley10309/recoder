// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

// Ticket Number 조회
import db from "../../config/db";

export const getTicketNumData = (req, res) => {
    const query = `
        SELECT ticket_num AS name
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