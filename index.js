const express = require('express');
const mongoose = require('mongoose');
const { connectDB } = require("./config/connectDB");
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 9005;

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('MongoDB connected');
//   app.listen(process.env.PORT, () => {
//     console.log(`Server running on port ${process.env.PORT}`);
//   });
// }).catch((err) => {
//   console.error('Database connection failed', err);
// });


app.get("/gsb-service/v0/health", (req, res) => {
    return res.send({ message: "gsb-service running" });
});

app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT}`
  );
});
