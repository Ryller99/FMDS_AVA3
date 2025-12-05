import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SISTEMA DE COBRANÇA API",
      version: "1.0.0",
      description: "API para gerenciar COBRANÇA de forma eficiente.",
    },
  },
  apis: ["./index.js"], // <-- arquivos onde estarão as anotações
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};