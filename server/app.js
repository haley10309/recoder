const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger/swagger");

app.use(
  cors({
    origin: process.env.CLIENT, // 로컬 클라이언트로 테스트 할 경우 `http://localhost:클라이언트포트`로 임시 설정 필요
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const templateRoutes = require("./src/routes/templateRoute");
const guideUploadRoutes = require("./src/routes/guideUploadRoute");
const applyTemplateRoutes = require("./src/routes/applyTemplateRoute");
const localizationRoutes = require("./src/routes/localizationRoute");
// const adminRoutes = require("./src/routes/admin");

app.use("/", guideUploadRoutes);
app.use("/", templateRoutes);
app.use("/", applyTemplateRoutes);
app.use("/", localizationRoutes);
// app.use("/admin", adminRoutes);
// app.use("/", adminRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log(`📘 Swagger 문서 👉 http://localhost:${process.env.PORT}/api-docs`);

module.exports = app;
