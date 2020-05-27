import express from "express";
import csrf from "csurf";
import dotenv from "dotenv";

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

router.post("/", csrfProtection, (req, res) => {
  res.json(req.body);
});

export default router;
