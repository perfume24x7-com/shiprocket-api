const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let shiprocketToken = "";

// 🔐 Login to Shiprocket
async function getToken() {
  try {
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
  const pincode = req.query.pincode;

  if (!pincode) {
    return res.status(400).json({ error: "Pincode is required" });
  }

  try {
    if (!shiprocketToken) {
      await getToken();
    }

    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=500081&delivery_postcode=${pincode}&cod=1&weight=0.5`,
      {
        headers: {
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to fetch serviceability" });
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
