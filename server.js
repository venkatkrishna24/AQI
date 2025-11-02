import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

// ✅ Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqi1-a04ee-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.database();

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ AQI Backend connected to Firebase!");
});

// ✅ Receive ESP32 sensor data
app.post("/data", async (req, res) => {
  try {
    const { pm25, pm10, temperature, humidity, location } = req.body;

    if (!pm25 || !pm10 || !temperature || !humidity || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("📩 Data received:", req.body);

    // ✅ Push data to Firebase
    const ref = db.ref("sensorData").push();
    await ref.set({
      pm25,
      pm10,
      temperature,
      humidity,
      location,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Data uploaded to Firebase successfully!",
    });
  } catch (error) {
    console.error("❌ Error uploading to Firebase:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading data",
    });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
