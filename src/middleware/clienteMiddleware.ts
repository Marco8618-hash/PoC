import { Request, Response, NextFunction } from "express";
import { Cliente } from "../domain/cliente";

// ─── Content-Type Validation ────────────────────────────────────────────────

const JSON_API_CONTENT_TYPE = "application/vnd.api+json";

export function validateClienteContentType(req: Request, res: Response, next: NextFunction): void {
  if (["POST", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes(JSON_API_CONTENT_TYPE)) {
      res.status(415).json({
        errors: [
          {
            status: "415",
            title: "Unsupported Media Type",
            detail: `Content-Type debe ser ${JSON_API_CONTENT_TYPE}`,
          },
        ],
      });
      return;
    }
  }
  next();
}

// ─── JSON:API Error Handler ─────────────────────────────────────────────────

export function clienteErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || 500;
  res.status(status).set("Content-Type", JSON_API_CONTENT_TYPE).json({
    errors: [
      {
        status: String(status),
        title: err.title || "Internal Server Error",
        detail: err.detail || err.message || "Error inesperado",
      },
    ],
  });
}

// ─── JSON:API Serialization ─────────────────────────────────────────────────

export function serializeCliente(cliente: Cliente, baseUrl: string) {
  const { id_cliente, ...attributes } = cliente;
  return {
    data: {
      type: "clientes",
      id: String(id_cliente),
      attributes,
      links: { self: `${baseUrl}/api/clientes/${id_cliente}` },
    },
    links: { self: `${baseUrl}/api/clientes/${id_cliente}` },
  };
}

export function serializeClientes(clientes: Cliente[], baseUrl: string) {
  return {
    data: clientes.map((c) => {
      const { id_cliente, ...attributes } = c;
      return {
        type: "clientes",
        id: String(id_cliente),
        attributes,
        links: { self: `${baseUrl}/api/clientes/${id_cliente}` },
      };
    }),
    links: { self: `${baseUrl}/api/clientes` },
  };
}

export function deserializeClienteBody(body: any): Record<string, any> {
  if (!body?.data?.attributes) {
    throw { status: 400, title: "Bad Request", detail: "El body debe tener la estructura { data: { type, attributes } }" };
  }
  return body.data.attributes;
}
