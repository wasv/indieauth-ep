import express from "express";
import dotenv from "dotenv";
import path from "path";
import logger from "morgan";

import authRouter from "./routes/auth.js";
import tokenRouter from "./routes/token.js";

var app = express();

app.use(logger("dev"));

app.set("trust proxy", "loopback");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(path.resolve(), "dist")));

app.use("/auth", authRouter);
app.use("/token", tokenRouter);

export default app;
