const express = require("express");
const router = express.Router();
const cors = require("cors");

const loginController = require("../controllers/admin/login");
const registerController = require("../controllers/admin/register");

router.post("/login", cors(), loginController.login);
router.post("/register", cors(), registerController.register);

module.exports = router;