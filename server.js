const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let shiprocketToken = "";

// 🔐 Generate Shiprocket Token
async function getToken() {
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    shiprocketToken = response.data.token;
    console.log("✅ Token Generated Successfully");
  } catch (error) {
    console.log(
      "❌ Error generating token:",
      error.response?.data || error.message
    );
  }
}

// 🔁 Route to manually generate token (for testing)
app.get("/get-token", async (req, res) => {
  try {
    await getToken();
    res.send("Token generated successfully");
  } catch (err) {
    res.status(500).send("Error generating token");
  }
});

// 📦 Check Pincode Serviceability
app.get("/check-pincode", async (req, res) => {
  try {
    const pincode = req.query.pincode;

    if (!pincode) {
      return res.status(400).json({ error: "Pincode is required" });
    }

    // Ensure token exists
    if (!shiprocketToken) {
      await getToken();
    }

    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        headers: {
          Authorization: `Bearer ${shiprocketToken}`,
        },
        params: {
          pickup_postcode: "500082", // your warehouse pincode
          delivery_postcode: pincode,
          cod: 1,
          weight: 0.5,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log(
      "❌ Serviceability Error:",
      err.response?.data || err.message
    );

    res.status(500).json({
      error: "Failed to fetch serviceability",
      details: err.response?.data || err.message,
    });
  }
});

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("🚀 Shiprocket API Connected");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
