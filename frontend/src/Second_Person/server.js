const express = require('express');
const cors = require('cors');
const locationData = require('./locationData.json');

const app = express();
app.use(cors());

app.get('/api/v1/filters/locations', (req, res) => {
    try {
        
        res.status(200).json({
            success: true,
            data: locationData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));