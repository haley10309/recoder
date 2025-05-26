const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
// const authenticateToken = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const checkTemplateController = require("../controllers/template/checkTemplateController");
const createTemplateController = require("../controllers/template/createTemplateController");
const getTicketNumController = require("../controllers/template/getTicketNumController");
const getTicketURLController = require("../controllers/template/getTicketURLController");
const getTemplateDetailsController = require("../controllers/template/getTemplateDetailsController");
const updateTemplateController = require("../controllers/template/updateTemplateController");

router.post("/check-template-exsist", cors(), checkTemplateController.checkTemplateData);
// router.post("/check-template-exsist", cors(), authenticateToken, checkTemplateController.checkTemplateData);
router.post("/get-template-details", cors(), getTemplateDetailsController.getTemplateDetailsData);
router.post("/create-template", upload.single('file'), cors(), createTemplateController.createTemplateData);
router.post("/update-template", multer().none(), cors(), updateTemplateController.updateTemplateData);
router.get("/get-ticket-number", cors(), getTicketNumController.getTicketNumData);
router.get("/get-ticket-url", cors(), getTicketURLController.getTicketURLData);

module.exports = router;