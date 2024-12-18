const mysql = require("mysql2/promise"); // Use promise-based MySQL for better async handling.
require("dotenv").config(); // Load environment variables from .env.

module.exports = async (req, res) => {
    // Allow only POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { payload } = req.body; // Extract payload from request body

    // Validate the payload
    if (!payload) {
        return res.status(400).json({ error: "Payload is required" });
    }

    try {
        // Create a connection to the MySQL database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Insert the payload into the database
        const [result] = await connection.execute(
            "INSERT INTO payload_data (payload) VALUES (?)",
            [JSON.stringify(payload)] // Store the payload as a JSON string
        );

        await connection.end(); // Close the database connection

        // Respond with success
        res.status(201).json({
            message: "Payload stored successfully",
            id: result.insertId, // Return the ID of the inserted record
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
