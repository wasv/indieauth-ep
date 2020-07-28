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
app.get("/", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.sendStatus(404);
    return;
  }

  // Allows for testing auth endpoint during development.
  const host = req.protocol + "://" + req.get("host");
  const auth_url = new URL(path.join(".", req.baseUrl, "auth"), host);
  res.send(
    "<html><head>" +
      "<link rel='authorization_endpoint' href='" +
      auth_url +
      "'/>" +
      "</head></html>"
  );
});

export default app;
