import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger";
import routes from "./routes/routes";
import path from 'path'; 
const app = express();
dotenv.config();

app.use(
  cors({
    origin: process.env.CLIENT, // 로컬 클라이언트로 테스트 할 경우 `http://localhost:클라이언트포트`로 임시 설정 필요
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use("/", routes);
app.use(
  "/api-docs",
  swaggerUi.serve as unknown as import("express").RequestHandler,
  swaggerUi.setup(swaggerSpec)as unknown as import("express").RequestHandler
);

console.log(`📘 Swagger 문서 👉 http://localhost:${process.env.PORT}/api-docs`);

// const publicPath = path.join(__dirname, 'public');
// app.use(express.static(publicPath));
// app.get('*', (req, res) => {
// res.sendFile(path.join(publicPath, 'index.html'));
// });

export default app;