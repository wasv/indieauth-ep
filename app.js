import express from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";

var app = express();

app.use(logger("dev"));

app.set("trust proxy", "loopback");
app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(path.resolve(), "public")));

app.use("/auth", authRouter);

export default app;
