// const express = require("express");
// const mysql = require("mysql2/promise");

// const app = express();
// const PORT = 2000;

// // Middleware to parse JSON requests
// app.use(express.json());

// // Database connection configuration
// const dbConfig = {
//     host: "162.214.68.40", // Replace with your database host
//     user: "home9admin_sellhome9", // Replace with your MySQL username
//     password: "Sell9Home", // Replace with your MySQL password
//     database: "home9admin_SellHome9" // Replace with your database name
// };

// // Test API to ensure server is running
// app.get("/test", (req, res) => {
//     res.status(200).json({ message: "Server is running!" });
// });

// // API endpoint to check database connection
// app.get("/api/db-check", async (req, res) => {
//     try {
//         const connection = await mysql.createConnection(dbConfig);
//         await connection.ping(); // Check the connection by pinging the server
//         await connection.end();
//         res.status(200).json({ message: "Database connection successful!" });
//     } catch (error) {
//         console.error("Database connection error:", error);
//         res.status(500).json({ error: "Database connection failed." });
//     }
// });

// // API endpoint to insert data into the `properties` table
// app.post("/api/:tableName", async (req, res) => {
//     const tableName = req.params.tableName; // Dynamic table name
//     const data = req.body; // JSON payload from the request

//     try {
//         const connection = await mysql.createConnection(dbConfig);

//         // Dynamically generate the keys and values for the SQL query
//         const keys = Object.keys(data).join(", ");
//         const placeholders = Object.keys(data).map(() => "?").join(", ");
//         const values = Object.values(data);

//         console.log(data)

//         const query = `INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`;

//         const [result] = await connection.execute(query, values);

//         await connection.end();

//         res.status(201).json({
//             message: `${tableName} data inserted successfully`,
//             id: result.insertId
//         });
//     } catch (error) {
//         console.error(`Error inserting data into ${tableName}:`, error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // // API endpoint to retrieve all properties from the `property_info` table
// // app.get("/api/properties", async (req, res) => {
// //     try {
// //         const connection = await mysql.createConnection(dbConfig);

// //         const [rows] = await connection.execute("SELECT * FROM property_info");

// //         await connection.end();

// //         res.status(200).json(rows);
// //     } catch (error) {
// //         console.error("Error fetching properties:", error);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // });

// // // API endpoint to retrieve Last property from the `property_info` table
// // app.get("/api/property/last", async (req, res) => {
// //     try {
// //         const connection = await mysql.createConnection(dbConfig);

// //         const [rows] = await connection.execute("SELECT * FROM property_info ORDER BY auto_id DESC LIMIT 1");

// //         await connection.end();

// //         res.status(200).json(rows);
// //     } catch (error) {
// //         console.error("Error fetching properties:", error);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // });










// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });












require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const historyRoutes = require("./routes/history");
const screenshotRoutes = require("./routes/screenshots");
const cors = require("cors"); // Import cors

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json({ limit: "10mb" })); // Increase payload size for screenshots
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// middle ware:
app.use(cors());

// app.use(
//   cors({
//     origin: ["http://localhost:5173/"], // Replace with your allowed origins
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );

app.use(express.json({ limit: "50mb" })); // Increase required size

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

const mongodbUri = `mongodb+srv://${dbUser}:${dbPass}@omd.wn73u.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=OMD`;

mongoose
  .connect(mongodbUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/history", historyRoutes);
app.use("/api/screenshots", screenshotRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
