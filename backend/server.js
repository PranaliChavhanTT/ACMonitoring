// const express = require('express');
// const cors = require('cors');
// const locationData = require('./data/locationData.json');

// const app = express();
// app.use(cors());

// app.get('/api/v1/filters/locations', (req, res) => {
//     res.status(200).json({ success: true, data: locationData });
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));



const express = require("express");
const cors = require("cors");

const zonalData = require("./data/locationData_zonal.json");
const geographicalData = require("./data/locationData_geographical.json");

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Optional 3TP authentication (OFF by default, so nothing changes until enabled).
// Start with REQUIRE_3TP_AUTH=1 to make these routes require the same 3TP token
// the React app already sends. The token is verified by the Django API
// (GET /api/auth/me/), which is the source of truth for 3TP sessions.
// ---------------------------------------------------------------------------
const REQUIRE_3TP_AUTH = process.env.REQUIRE_3TP_AUTH === "1";
const DJANGO_AUTH_URL =
    process.env.DJANGO_AUTH_URL || "http://localhost:8000/api/auth/me/";

async function require3tpAuth(req, res, next) {
    if (!REQUIRE_3TP_AUTH) return next();

    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ success: false, message: "Authentication required." });
    }

    try {
        const check = await fetch(DJANGO_AUTH_URL, {
            headers: { Authorization: authorization, Accept: "application/json" },
        });
        if (check.status === 200) return next();
        return res.status(401).json({ success: false, message: "3TP session expired or invalid." });
    } catch (err) {
        return res.status(502).json({ success: false, message: "Auth service unavailable." });
    }
}

app.use("/api/v1/filters", require3tpAuth);

app.get("/api/v1/filters/locations/zonal", (req, res) => {
    res.status(200).json({
        success: true,
        hierarchy_type: "ZONAL",
        data: zonalData
    });
});

app.get("/api/v1/filters/locations/geographical", (req, res) => {
    res.status(200).json({
        success: true,
        hierarchy_type: "GEOGRAPHICAL",
        data: geographicalData
    });
});

app.get("/api/v1/filters/locations", (req, res) => {
    res.status(200).json({
        success: true,

        zonal: {
            hierarchy_type: "ZONAL",
            data: zonalData
        },

        geographical: {
            hierarchy_type: "GEOGRAPHICAL",
            data: geographicalData
        }
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
