const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Database connection configuration
const dbConfig = {
    host: "162.214.68.40", // Replace with your database host
    user: "home9admin_sellhome9", // Replace with your MySQL username
    password: "Sell9Home", // Replace with your MySQL password
    database: "home9admin_propwire_db" // Replace with your database name
};

// Test API to ensure server is running
app.get("/test", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});

// API endpoint to check database connection
app.get("/api/db-check", async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.ping(); // Check the connection by pinging the server
        await connection.end();
        res.status(200).json({ message: "Database connection successful!" });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ error: "Database connection failed." });
    }
});

// API endpoint to insert data into the `properties` table
app.post("/api/property", async (req, res) => {
    const propertyData = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Build a query dynamically based on the JSON keys and values
        const keys = Object.keys(propertyData).join(", ");
        const placeholders = Object.keys(propertyData).map(() => "?").join(", ");
        const values = Object.values(propertyData);

        const query = `INSERT INTO property_info (${keys}) VALUES (${placeholders})`;

        const [result] = await connection.execute(query, values);

        await connection.end();

        res.status(201).json({
            message: "Property inserted successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error("Error inserting property:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// API endpoint to retrieve all properties from the `property_info` table
app.get("/api/properties", async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute("SELECT * FROM property_info");

        await connection.end();

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// API endpoint to retrieve Last property from the `property_info` table
app.get("/api/property/last", async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute("SELECT * FROM property_info ORDER BY auto_id DESC LIMIT 1");

        await connection.end();

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
