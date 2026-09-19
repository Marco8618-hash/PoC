import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import clienteRoutes from "./routes/clienteRoutes";
import {
  validateClienteContentType,
  clienteErrorHandler,
  benchmarkMiddleware,
} from "./middleware/clienteMiddleware";

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cargar especificación OpenAPI
const swaggerDocument = YAML.load(path.resolve(__dirname, "../openapi.yaml"));

// 2. Parsear JSON estándar y JSON:API
app.use(express.json({ type: "application/vnd.api+json" }));
app.use(express.json());

// 3. Documentación Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Servir archivos estáticos del frontend
app.use(express.static(path.resolve(__dirname, "../public")));

// 5. Middlewares de métricas y validación para la API
app.use("/api/clientes", benchmarkMiddleware);
app.use("/api/clientes", validateClienteContentType);

// 6. Rutas del CRUD
app.use("/api/clientes", clienteRoutes);

// 7. Manejo global de errores JSON:API
app.use(clienteErrorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger UI en http://localhost:${PORT}/api-docs`);
});

export default app;