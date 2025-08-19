const express = require("express");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary (using env variables)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// API route to delete an image
app.post("/delete", async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ error: "Missing public_id" });

    const result = await cloudinary.uploader.destroy(public_id);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
