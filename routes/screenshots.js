const express = require("express");
const Screenshot = require("../models/Screenshots");
const router = express.Router();
const axios = require("axios");
const FormData = require("form-data"); // ✅ Import FormData
const sharp = require("sharp"); // Install sharp using: npm install sharp


const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

// // POST: Save a screenshot to the database (Base64 image)
// router.post("/", async (req, res) => {
//   try {
//     const { screenshot, timestamp } = req.body;

//     if (!screenshot) {
//       return res.status(400).json({ error: "Screenshot data is required." });
//     }

//     const newScreenshot = new Screenshot({ screenshot, timestamp });
//     await newScreenshot.save();

//     console.log("SS Success");

//     res.status(201).json({ message: "Screenshot saved successfully." });
//   } catch (error) {
//     console.error("Error saving screenshot:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });


// POST: Save a compressed screenshot to the database (Base64 image - 30kb limit)
router.post("/", async (req, res) => {
  try {
    const { screenshot, timestamp } = req.body;

    if (!screenshot) {
      return res.status(400).json({ error: "Screenshot data is required." });
    }

    // Convert Base64 to Buffer
    const buffer = Buffer.from(screenshot.split(",")[1], "base64");

    // Compress the image without changing resolution
    let quality = 80; // Initial guess
    let compressedBuffer = await sharp(buffer)
      .jpeg({ quality }) // Adjust quality
      .toBuffer();

    // Dynamically adjust quality to ensure size is <= 30KB
    while (compressedBuffer.length > 30 * 1024 && quality > 10) {
      quality -= 5; // Reduce quality step by step
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality })
        .toBuffer();
    }

    // Convert back to Base64
    const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;

    // Save to DB
    const newScreenshot = new Screenshot({ screenshot: compressedBase64, timestamp });
    await newScreenshot.save();

    console.log(`SS Success - Final Size: ${compressedBuffer.length / 1024} KB, Quality: ${quality}`);

    res.status(201).json({ message: "Screenshot saved successfully." });
  } catch (error) {
    console.error("Error saving screenshot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// POST: Save a compressed screenshot to the database (Base64 image - 100kb limit)
// router.post("/", async (req, res) => {
//   try {
//     const { screenshot, timestamp } = req.body;

//     if (!screenshot) {
//       return res.status(400).json({ error: "Screenshot data is required." });
//     }

//     // Convert Base64 to Buffer
//     const buffer = Buffer.from(screenshot.split(",")[1], "base64");

//     // Initial quality guess
//     let quality = 90; 
//     let compressedBuffer = await sharp(buffer)
//       .jpeg({ quality }) // Set initial quality
//       .toBuffer();

//     // Adjust quality dynamically to keep file size ≤ 100KB
//     while (compressedBuffer.length > 100 * 1024 && quality > 10) {
//       quality -= 5; // Reduce quality step by step
//       compressedBuffer = await sharp(buffer)
//         .jpeg({ quality })
//         .toBuffer();
//     }

//     // Convert back to Base64
//     const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;

//     // Save to DB
//     const newScreenshot = new Screenshot({ screenshot: compressedBase64, timestamp });
//     await newScreenshot.save();

//     console.log(`SS Success - Final Size: ${(compressedBuffer.length / 1024).toFixed(2)} KB, Quality: ${quality}`);

//     res.status(201).json({ message: "Screenshot saved successfully." });
//   } catch (error) {
//     console.error("Error saving screenshot:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });


// // POST: Save a screenshot to the database (Base64 image) and upload to ImageBB
// router.post("/", async (req, res) => {
//   try {
//     const { screenshot, timestamp } = req.body;

//     // Validate the screenshot field (Base64 image)
//     if (!screenshot || !/^data:image\/(png|jpeg|jpg);base64,/.test(screenshot)) {
//       return res.status(400).json({ error: "Invalid image format. Must be Base64-encoded PNG/JPG." });
//     }

//     // Create FormData for ImageBB
//     const form = new FormData();
//     form.append("key", '21ec0f957d13640bc92a530e788f6b1e');
//     form.append("image", screenshot.split(",")[1]); // Remove the Base64 prefix

//     // Upload image to ImageBB
//     const response = await axios.post("https://api.imgbb.com/1/upload", form, {
//       headers: form.getHeaders(),
//     });

//     if (!response.data?.data?.url) {
//       throw new Error("ImageBB upload failed.");
//     }

//     const imageUrl = response.data.data.url; // Get the ImageBB URL

//     // Save imageUrl and timestamp to the database
//     const newScreenshot = new Screenshot({ screenshot: imageUrl, timestamp: timestamp});
//     await newScreenshot.save();

//     console.log("Screenshot saved:", imageUrl);
//     res.status(201).json({ message: "Screenshot saved successfully.", imageUrl });

//   } catch (error) {
//     console.error("Error saving screenshot:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// GET: Paginated screenshots


router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 200, filterDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (filterDate) {
      const date = new Date(filterDate);

      // Start of the day in local time
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      // End of the day in local time
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filter.timestamp = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const screenshots = await Screenshot.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Screenshot.countDocuments(filter);

    res.status(200).json({
      screenshots,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching screenshots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


  
  // DELETE: Delete a screenshot by ID
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Screenshot.findByIdAndDelete(id);
  
      if (!result) {
        return res.status(404).json({ error: "Screenshot not found." });
      }
  
      const totalCount = await Screenshot.countDocuments(); // Update total count
      res.status(200).json({
        message: "Screenshot deleted successfully.",
        totalCount,
      });
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });


// DELETE: Delete all screenshots for a specific date
router.delete("/", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const result = await Screenshot.deleteMany({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({
      message: `${result.deletedCount} screenshots deleted for the specified date.`,
    });
  } catch (error) {
    console.error("Error deleting screenshots by date:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// GET: Download all screenshots as a ZIP file
router.get("/download", async (req, res) => {
  try {
    console.log("Download")
    const screenshots = await Screenshot.find();
    if (screenshots.length === 0) {
      return res.status(404).json({ error: "No screenshots available for download." });
    }

    const zipPath = path.join(__dirname, "screenshots.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      res.download(zipPath, "screenshots.zip", (err) => {
        if (err) console.error("Error sending zip file:", err);
        fs.unlinkSync(zipPath);
      });
    });

    archive.on("error", (err) => {
      console.error("Error creating zip:", err);
      res.status(500).json({ error: "Error creating zip file." });
    });

    archive.pipe(output);

    screenshots.forEach((screenshot, index) => {
      const fileName = `screenshot_${index + 1}.png`;
      archive.append(Buffer.from(screenshot.screenshot, "base64"), { name: fileName });
    });

    archive.finalize();
  } catch (error) {
    console.error("Error downloading screenshots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Function to convert base64 to an image file
const saveBase64Image = (base64String, filePath) => {
  try {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(filePath, base64Data, "base64");
  } catch (error) {
    console.error("Error saving base64 image:", error);
  }
};


// GET: Download all screenshots as a ZIP file
router.get("/download/all", async (req, res) => {
  try {
    const screenshots = await Screenshot.find().sort({ timestamp: -1 });
    if (screenshots.length === 0) {
      return res.status(404).json({ error: "No screenshots available for download." });
    }

    const tempDir = path.join(__dirname, "temp_screenshots");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    screenshots.forEach((screenshot, index) => {
      if (screenshot.screenshot) {
        const filePath = path.join(tempDir, `screenshot_${index + 1}.png`);
        saveBase64Image(screenshot.screenshot, filePath);
      }
    });

    const zipPath = path.join(__dirname, `screenshots_all.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      res.download(zipPath, "screenshots_all.zip", (err) => {
        if (err) console.error("Error sending zip file:", err);
        fs.unlinkSync(zipPath);
        fs.rmSync(tempDir, { recursive: true, force: true });
      });
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).json({ error: "Error creating ZIP file." });
    });

    archive.pipe(output);

    fs.readdirSync(tempDir).forEach((file) => {
      archive.file(path.join(tempDir, file), { name: file });
    });

    archive.finalize();
  } catch (error) {
    console.error("Error downloading screenshots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




// GET: Download specified number of screenshots as a ZIP file and delete from the database
router.get("/download/:count", async (req, res) => {
  try {
    const { count } = req.params;
    const screenshotCount = parseInt(count);
    if (isNaN(screenshotCount) || screenshotCount <= 0) {
      return res.status(400).json({ error: "Invalid count parameter." });
    }

    const screenshots = await Screenshot.find().sort({ timestamp: -1 }).limit(screenshotCount);
    if (screenshots.length === 0) {
      return res.status(404).json({ error: "No screenshots available for download." });
    }

    const tempDir = path.join(__dirname, "temp_screenshots");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    screenshots.forEach((screenshot, index) => {
      const filePath = path.join(tempDir, `screenshot_${index + 1}.png`);
      saveBase64Image(screenshot.screenshot, filePath);
    });

    const zipPath = path.join(__dirname, `screenshots_${screenshotCount}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", async () => {
      // Send the ZIP file for download
      res.download(zipPath, `screenshots_${screenshotCount}.zip`, async (err) => {
        if (err) {
          console.error("Error sending zip file:", err);
        } else {
          try {
            // Log the IDs to ensure they are valid
            const screenshotIds = screenshots.map(ss => ss._id);
            console.log("Screenshots IDs to delete:", screenshotIds);

            if (screenshotIds.length > 0) {
              // Attempt to delete the screenshots from the database after successful download
              const deleteResult = await Screenshot.deleteMany({ _id: { $in: screenshotIds } });
              console.log(`Deleted ${deleteResult.deletedCount} screenshots from the database.`);
            } else {
              console.error("No valid screenshot IDs found for deletion.");
            }

            // Delete ZIP and temp screenshots after download
            fs.unlinkSync(zipPath);  // Delete the ZIP file
            fs.rmSync(tempDir, { recursive: true, force: true });  // Delete the temp directory and screenshots
          } catch (deleteError) {
            console.error("Error deleting screenshots from database:", deleteError);
          }
        }
      });
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).json({ error: "Error creating ZIP file." });
    });

    archive.pipe(output);

    fs.readdirSync(tempDir).forEach((file) => {
      archive.file(path.join(tempDir, file), { name: file });
    });

    archive.finalize();
  } catch (error) {
    console.error("Error downloading screenshots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




module.exports = router;
