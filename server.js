import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch"; // to send data to Firebase

const app = express();
const PORT = process.env.PORT || 8080;

// Firebase Realtime Database URL (use your full database link)
const FIREBASE_URL = "https://aqi1-a04ee-default-rtdb.asia-southeast1.firebasedatabase.app/data.json";

app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("🌍 Firebase Backend Running!");
});

// Receive data from ESP32
app.post("/upload", async (req, res) => {
  try {
    const { pm25, pm10, temperature, humidity, location } = req.body;

    // Validate all fields exist
    if (
      pm25 === undefined ||
      pm10 === undefined ||
      temperature === undefined ||
      humidity === undefined ||
      !location
    ) {
      return res.status(400).json({ error: "Missing or invalid data" });
    }

    // Prepare data for Firebase
    const payload = {
      pm25,
      pm10,
      temperature,
      humidity,
      location,
      timestamp: new Date().toISOString(),
    };

    // Send to Firebase Realtime Database
    const response = await fetch(FIREBASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("🔥 Firebase Error:", err);
      return res.status(500).send("Firebase upload failed");
    }

    console.log("✅ Data uploaded to Firebase:", payload);
    res.status(200).send("Data stored successfully");
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
