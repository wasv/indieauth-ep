import express from "express";
import csrf from "csurf";
import dotenv from "dotenv";
import argon2 from "argon2";

dotenv.config();

var router = express.Router();

var csrfProtection = csrf({ cookie: true });

router.get("/", csrfProtection, (req, res) => {
  let scopes = [];
  if (req.query.scope) {
    scopes = req.query.scope.split(" ");
  }
  res.render("auth", {
    me: process.env.ME,
    scopes: scopes,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
    csrfToken: req.csrfToken(),
  });
});

router.post("/", csrfProtection, async (req, res) => {
  try {
    if (await argon2.verify(process.env.PW_HASH, req.body.password)) {
      const body = req.body;
      delete body.password;
      res.json(body);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.json(err).status(500);
  }
});

export default router;
