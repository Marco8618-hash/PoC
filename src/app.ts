import express from "express";
import path from "path";
import clienteRoutes from "./routes/clienteRoutes";
import { validateClienteContentType, clienteErrorHandler } from "./middleware/clienteMiddleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Parsear JSON
app.use(express.json({ type: "application/vnd.api+json" }));
app.use(express.json());

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, "..", "public")));

// Middleware JSON:API
app.use("/api/clientes", validateClienteContentType);

// Rutas
app.use("/api/clientes", clienteRoutes);

// Error handler JSON:API
app.use(clienteErrorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
