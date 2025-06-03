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

const editTemplateRoute = require("./src/routes/editTemplateRoute");
const editLocalizationEntriesRoute = require("./src/routes/editLocalizationEntriesRoute");
const applyTemplateRoute = require("./src/routes/applyTemplateRoute");
const guideRoute = require("./src/routes/guideRoute");
// const adminRoute = require("./src/routes/adminRoute");

app.use("/", editTemplateRoute);
app.use("/", editLocalizationEntriesRoute);
app.use("/", applyTemplateRoute);
app.use("/", guideRoute);
// app.use("/admin", adminRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log(`📘 Swagger 문서 👉 http://localhost:${process.env.PORT}/api-docs`);

module.exports = app;
