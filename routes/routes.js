const router = require("express").Router();

router.get("/boleto/:code", async (req, res) => {
  const { code } = req.params;

  try {
    return res.status(200).json({ code: code });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

module.exports = router;
