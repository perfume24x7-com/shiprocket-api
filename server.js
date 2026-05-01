const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let shiprocketToken = "";

// 🔐 Login to Shiprocket
async function getToken() {
  try {
    console.log("EMAIL:", process.env.SHIPROCKET_EMAIL);
console.log("PASSWORD:", process.env.SHIPROCKET_PASSWORD);
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: "dhiraj@perfume24x7.com",
        password: "Yua8*bntwR7pLhR2LOJHz7W%vluMr&x@",
      }
    );

    shiprocketToken = response.data.token;
    console.log("Token Generated");
  } catch (error) {
    console.log("Error generating token", error.message);
  }
}

// Call once when server starts
app.get("/get-token", async (req, res) => {
  try {
    await getToken();
    res.send("Token generated");
  } catch (err) {
    res.status(500).send("Error generating token");
  }
});
// 📦 Check Pincode Serviceability
app.get("/check-pincode", async (req, res) => {
  try {
    const pincode = req.query.pincode;

    const token = await getToken(); // ALWAYS fresh token

    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        params: {
          pickup_postcode: "500082",
          delivery_postcode: pincode,
          cod: 1,
          weight: 0.5
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});
// 🧪 Test route
app.get("/", (req, res) => {
  res.send("Shiprocket API Connected");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
