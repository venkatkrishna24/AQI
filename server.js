import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

// Load your Firebase service account key
// Place your Firebase service account JSON key file in the project root
// and rename it to serviceAccountKey.json
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Root route
app.get("/", (req, res) => {
  res.send("🌍 AQI Backend Running Successfully!");
});

// Receive sensor data from ESP32
app.post("/data", async (req, res) => {
  try {
    const { pm25, pm10, temperature, humidity, location } = req.body;

    if (
      pm25 === undefined ||
      pm10 === undefined ||
      temperature === undefined ||
      humidity === undefined ||
      !location
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prepare the data to store
    const timestamp = new Date().toISOString();
    const data = {
      pm25,
      pm10,
      temperature,
      humidity,
      location,
      timestamp,
    };

    // Store in Firebase Firestore
    await db.collection("sensorData").add(data);

    console.log("✅ Data stored:", data);

    res.status(200).json({ message: "Data stored successfully!" });
  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
