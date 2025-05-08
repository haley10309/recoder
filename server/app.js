const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger/swagger");

app.use(
  cors({
    origin: process.env.CLIENT,
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const templateRoutes = require("./src/routes/templateRoute");
const guideUploadRoutes = require("./src/routes/guideUploadRoute");
const tobeAppliedRoutes = require("./src/routes/tobeAppliedRoute");
const localizationRoutes = require("./src/routes/localizationRoute");

// template 생성 및 수정 페이지 & QA 페이지
app.use("/", guideUploadRoutes);
app.use("/", templateRoutes);
app.use("/check-template", templateRoutes);
app.use("/get-template-details", templateRoutes);
app.use("/update-template", templateRoutes);

// tobeApplied 페이지
app.use("/", tobeAppliedRoutes);
app.use("/process-file", tobeAppliedRoutes);

// localization 페이지
app.use("/", localizationRoutes);

// swagger 페이지
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log(`📘 Swagger 문서 👉 http://localhost:${process.env.PORT}/api-docs`);

module.exports = app;
