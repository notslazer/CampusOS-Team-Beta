// Backend Entry Point
require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('CampusOS API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
