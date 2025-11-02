import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ AQI Backend is running successfully!");
});

// ✅ Route to receive ESP32 data
app.post("/data", (req, res) => {
  try {
    const { pm25, pm10, temperature, humidity, location } = req.body;

    console.log("📩 Data received from ESP32:");
    console.log({
      pm25,
      pm10,
      temperature,
      humidity,
      location,
    });

    // Here you can add Firebase upload logic later if needed

    res.status(200).send({
      success: true,
      message: "Data received successfully!",
    });
  } catch (error) {
    console.error("❌ Error processing ESP32 data:", error);
    res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
