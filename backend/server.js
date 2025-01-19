//const express = require("express");
import express from "express";
import dotenv from "dotenv";

import authRoute from "./routes/auth.route.js";
import connectDB from "./DB/connectDB.js";

dotenv.config()
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/auth", authRoute)

app.listen(PORT, () => {    
    console.log(`Server running on port ${PORT}`);
    connectDB();
});