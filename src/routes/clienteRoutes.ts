import { Router, Request, Response, NextFunction } from "express";
import { clienteService } from "../service/clienteService";
import { serializeCliente, serializeClientes, deserializeClienteBody } from "../middleware/clienteMiddleware";

const router = Router();
const CONTENT_TYPE = "application/vnd.api+json";

function getBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

// GET /api/clientes
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientes = await clienteService.getAll();
    res.set("Content-Type", CONTENT_TYPE).json(serializeClientes(clientes, getBaseUrl(req)));
  } catch (err) {
    next(err);
  }
});

// GET /api/clientes/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cliente = await clienteService.getById(Number(req.params.id));
    res.set("Content-Type", CONTENT_TYPE).json(serializeCliente(cliente, getBaseUrl(req)));
  } catch (err) {
    next(err);
  }
});

// POST /api/clientes
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attrs = deserializeClienteBody(req.body);
    const cliente = await clienteService.create({
      nombre: attrs.nombre,
      apellido: attrs.apellido,
      dni: attrs.dni,
      email: attrs.email,
    });
    res.status(201).set("Content-Type", CONTENT_TYPE).json(serializeCliente(cliente, getBaseUrl(req)));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/clientes/:id
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attrs = deserializeClienteBody(req.body);
    const cliente = await clienteService.update(Number(req.params.id), attrs);
    res.set("Content-Type", CONTENT_TYPE).json(serializeCliente(cliente, getBaseUrl(req)));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/clientes/:id
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clienteService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
