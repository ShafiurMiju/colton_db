require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const historyRoutes = require("./routes/history");
const screenshotRoutes = require("./routes/screenshots");
const cors = require("cors"); // Import cors

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json({ limit: "10mb" })); // Increase payload size for screenshots
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// middle ware:
app.use(cors());

app.use(express.json({ limit: "50mb" })); // Increase required size

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;


const mongodbUri = `mongodb+srv://${dbUser}:${dbPass}@omd.wn73u.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=OMD`;

// const mongodbUri = `mongodb://127.0.0.1:27017/Extension`;

mongoose
  .connect(mongodbUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/history", historyRoutes);
app.use("/api/screenshots", screenshotRoutes);


// === MongoDB Storage Stats Route (Total, Used, and Unused Storage in MB) ===
app.get("/api/db-storage", async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();

    const totalStorageMB = (stats.storageSize / (1024 * 1024)).toFixed(2);
    const usedStorageMB = (stats.dataSize / (1024 * 1024)).toFixed(2);
    const unusedStorageMB = (totalStorageMB - usedStorageMB).toFixed(2);

    res.json({
      totalStorageMB,
      usedStorageMB,
      unusedStorageMB
    });

  } catch (error) {
    console.error("Error fetching DB storage stats:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
