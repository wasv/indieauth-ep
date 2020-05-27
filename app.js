import express from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import tokenRouter from "./routes/token.js";

var app = express();

app.use(logger("dev"));

app.set("trust proxy", "loopback");
app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(path.resolve(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});
app.use("/auth", authRouter);
app.use("/token", tokenRouter);

export default app;
