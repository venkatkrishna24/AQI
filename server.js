import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

app.get("/", (req, res) => {
  res.send("✅ AQI Realtime Backend Running Successfully!");
});

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

    const timestamp = new Date().toISOString();
    const data = { pm25, pm10, temperature, humidity, location, timestamp };

    await db.ref(`sensorData/${location}`).push(data);

    console.log("✅ Data stored:", data);
    res.status(200).json({ message: "Data stored successfully!" });
  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
