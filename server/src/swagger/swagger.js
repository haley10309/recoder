// swagger 기본 설정
require("dotenv").config(); 

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recoder API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  apis: ["./src/swagger/docs/*.js"],
};

const specs = swaggerJsdoc(options);
module.exports = specs;

