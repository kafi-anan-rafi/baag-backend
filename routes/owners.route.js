const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Owners Route!");
});

module.exports = router;
