const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let shiprocketToken = "";

// 🔐 Login to Shiprocket (GET FRESH TOKEN EVERY TIME)
async function getToken() {
  try {
    console.log("EMAIL:", process.env.SHIPROCKET_EMAIL);

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    shiprocketToken = response.data.token;
    console.log("✅ Token Generated");
  } catch (error) {
    console.log(
      "❌ Error generating token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 📦 Check Pincode Serviceability
app.get("/check-pincode", async (req, res) => {
  try {
    const pincode = req.query.pincode;

    if (!pincode) {
      return res.status(400).json({ error: "Pincode is required" });
    }

    // 🔥 ALWAYS GET FRESH TOKEN (IMPORTANT FIX)
    await getToken();

    console.log("🔑 TOKEN USED:", shiprocketToken);

    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        headers: {
          Authorization: `Bearer ${shiprocketToken}`,
        },
        params: {
          pickup_postcode: "500082",
          delivery_postcode: pincode,
          cod: 1,
          weight: 0.5,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log(
      "❌ ERROR:",
      err.response?.data || err.message
    );
    res.status(500).json({
      error: err.response?.data || "Failed to fetch serviceability",
    });
  }
});

// 🧪 Health check
app.get("/", (req, res) => {
  res.send("Shiprocket API Connected ✅");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
