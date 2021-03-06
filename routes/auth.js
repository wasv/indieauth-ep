import express from "express";
import csrf from "csurf";
import dotenv from "dotenv";
import argon2 from "argon2";
import crypto from "crypto";
import process from "process";
import qs from "qs";

dotenv.config();

var router = express.Router();

var csrfProtection = csrf({ cookie: true });

const create_code = (message, appended_data, ttl) => {
  const hmac = crypto.createHmac("sha3-256", process.env.HMAC_KEY);
  const expires = process.hrtime()[0] + (ttl || 300);
  const body = message + expires + appended_data;
  hmac.update(body);
  return expires.toString(16) + "$" + hmac.digest("hex") + "$" + appended_data;
};

const verify_code = (message, code) => {
  const code_parts = code.split("$");
  const expires = parseInt(code_parts[0], 16);

  if (expires < process.hrtime()[0]) return false;

  const appended_data = code_parts[2];
  const hmac = crypto.createHmac("sha3-256", process.env.HMAC_KEY);
  const body = message + expires + appended_data;
  hmac.update(body);
  const exp_code = hmac.digest("hex");
  return exp_code === code_parts[1];
};

router.get("/", csrfProtection, (req, res) => {
  let scopes = [];
  if (req.query.scope) {
    scopes = req.query.scope.split(" ");
  }
  if (!req.query.client_id || !req.query.redirect_uri || !req.query.state) {
    res.send("Missing parameters.").status(400);
    return;
  }
  res.render("auth", {
    me: process.env.ME,
    scopes: scopes,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
    state: req.query.state,
    csrfToken: req.csrfToken(),
  });
});

router.post("/verify", csrfProtection, async (req, res) => {
  try {
    if ((await argon2.verify(process.env.PW_HASH, req.body.password)) != true) {
      res.sendStatus(401);
      return;
    }
  } catch (err) {
    console.error("ERR: " + err);
    res.status(500);
    return;
  }

  const message = process.env.ME + req.body.redirect_uri + req.body.client_id;

  let scopes = "";
  if (req.body.scope) {
    scopes = req.body.scope.join(" ");
  }

  const code = create_code(message, scopes);

  const rd_url = new URL(
    "?" + qs.stringify({ state: req.body.state, code }),
    req.body.redirect_uri
  );

  res.redirect(rd_url.toString());
});

router.post("/", (req, res) => {
  const message = process.env.ME + req.body.redirect_uri + req.body.client_id;
  if (!req.body.code || !verify_code(message, req.body.code)) {
    res.send("Invalid Code.").status(400);
    return;
  }

  let auth_resp = { me: process.env.ME };

  const scopes = req.body.code.split("$")[2];
  if (scopes) auth_resp.scope = scopes;

  res.json(auth_resp);
});

export default router;
