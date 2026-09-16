import { Request, Response, NextFunction } from "express";
import { Cliente } from "../domain/cliente";
import { ZodError } from "zod";

// ─── Benchmark: medir bytes enviados y recibidos ────────────────────────────

export function benchmarkMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Bytes enviados por el cliente (request body)
  const requestBody = req.body ? JSON.stringify(req.body) : "";
  const bytesEnviados = Buffer.byteLength(requestBody, "utf8");

  // Interceptar res.json para medir bytes recibidos por el cliente (response body)
  const originalJson = res.json.bind(res);
  res.json = function (body: any): Response {
    const responseBody = JSON.stringify(body);
    const bytesRecibidos = Buffer.byteLength(responseBody, "utf8");

    res.set("X-Bytes-Enviados", String(bytesEnviados));
    res.set("X-Bytes-Recibidos", String(bytesRecibidos));
    res.set("Access-Control-Expose-Headers", "X-Bytes-Enviados, X-Bytes-Recibidos");

    return originalJson(body);
  };

  next();
}

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

// ERROR HANDLER

export function clienteErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  // Errores de validación Zod → 400 con detalle por campo
  if (err instanceof ZodError) {
    const errors = err.issues.map((e: any) => ({
      status: "400",
      title: "Datos inválidos",
      detail: e.message,
      source: { pointer: `/data/attributes/${e.path.join(".")}` },
    }));
    res.status(400).set("Content-Type", JSON_API_CONTENT_TYPE).json({ errors });
    return;
  }

  // Errores de Prisma por unique constraint (dni/email duplicado) → 409
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "campo";
    res.status(409).set("Content-Type", JSON_API_CONTENT_TYPE).json({
      errors: [
        {
          status: "409",
          title: "Conflict",
          detail: `Ya existe un cliente con ese ${field}`,
          source: { pointer: `/data/attributes/${field}` },
        },
      ],
    });
    return;
  }

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

// Parametros de la Query

export interface JsonApiQuery {
  filter: Record<string, string>;
  fields: string[];
  sort: { field: string; order: "asc" | "desc" }[];
  page: { limit?: number; offset?: number };
}

export function parseJsonApiQuery(query: Record<string, any>): JsonApiQuery {
  // Express + qs parsea filter[campo]=valor como { filter: { campo: valor } }
  const filter: Record<string, string> = {};
  if (query.filter && typeof query.filter === "object") {
    for (const [key, value] of Object.entries(query.filter)) {
      if (typeof value === "string") filter[key] = value;
    }
  }

  // Express + qs parsea fields[clientes]=x,y como { fields: { clientes: "x,y" } }
  let fields: string[] = [];
  if (query.fields && typeof query.fields === "object" && typeof query.fields.clientes === "string") {
    fields = query.fields.clientes.split(",").map((f: string) => f.trim());
  }

  // sort=campo1,-campo2  (no usa brackets, llega como string)
  let sort: { field: string; order: "asc" | "desc" }[] = [];
  if (typeof query.sort === "string") {
    sort = query.sort.split(",").map((s: string) => {
      s = s.trim();
      if (s.startsWith("-")) return { field: s.slice(1), order: "desc" as const };
      return { field: s, order: "asc" as const };
    });
  }

  // Express + qs parsea page[limit]=N como { page: { limit: "N" } }
  const page: { limit?: number; offset?: number } = {};
  if (query.page && typeof query.page === "object") {
    if (query.page.limit) page.limit = Number(query.page.limit);
    if (query.page.offset) page.offset = Number(query.page.offset);
  }

  return { filter, fields, sort, page };
}

// ─── JSON:API Serialization ─────────────────────────────────────────────────

function filterAttributes(allAttributes: Record<string, any>, fields?: string[]): Record<string, any> {
  if (!fields || fields.length === 0) return allAttributes;
  const filtered: Record<string, any> = {};
  for (const field of fields) {
    if (field in allAttributes) filtered[field] = allAttributes[field];
  }
  return filtered;
}

export function serializeCliente(cliente: Cliente, baseUrl: string, fields?: string[]) {
  const { id_cliente, ...allAttributes } = cliente;
  const attributes = filterAttributes(allAttributes, fields);
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

export function serializeClientes(clientes: Cliente[], baseUrl: string, fields?: string[], meta?: Record<string, any>) {
  const result: any = {
    data: clientes.map((c) => {
      const { id_cliente, ...allAttributes } = c;
      const attributes = filterAttributes(allAttributes, fields);
      return {
        type: "clientes",
        id: String(id_cliente),
        attributes,
        links: { self: `${baseUrl}/api/clientes/${id_cliente}` },
      };
    }),
    links: { self: `${baseUrl}/api/clientes` },
  };
  if (meta) result.meta = meta;
  return result;
}

export function deserializeClienteBody(body: any): Record<string, any> {
  if (!body?.data?.attributes) {
    throw { status: 400, title: "Bad Request", detail: "El body debe tener la estructura { data: { type, attributes } }" };
  }
  return body.data.attributes;
}
