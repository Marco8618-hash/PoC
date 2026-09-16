import { PrismaClient, Prisma } from "@prisma/client";
import { Cliente } from "../domain/cliente";

const prisma = new PrismaClient();

// ─── Query Options para JSON:API ────────────────────────────────────────────

export interface QueryOptions {
  filter?: Record<string, string>;
  sort?: { field: string; order: "asc" | "desc" }[];
  page?: { limit?: number; offset?: number };
}

function buildWhere(filter?: Record<string, string>): Prisma.ClienteWhereInput {

  if (!filter || Object.keys(filter).length === 0) return {};

  const where: Prisma.ClienteWhereInput = {};
  const validFields = ["nombre", "apellido", "dni", "email"];

  for (const [key, value] of Object.entries(filter)) {
    if (validFields.includes(key)) {
      (where as any)[key] = { contains: value };
    }
  }

  return where;
}

function buildOrderBy(sort?: { field: string; order: "asc" | "desc" }[]): Prisma.ClienteOrderByWithRelationInput[] {

  if (!sort || sort.length === 0) return [];

  const validFields = ["id_cliente", "nombre", "apellido", "dni", "email"];

  return sort
    .filter((s) => validFields.includes(s.field))
    .map((s) => ({ [s.field]: s.order }));
}

//Repository

export const clienteRepository = {

  findAll(options?: QueryOptions): Promise<Cliente[]> {
    const where = buildWhere(options?.filter);
    const orderBy = buildOrderBy(options?.sort);

    return prisma.cliente.findMany({
      where,
      orderBy,
      skip: options?.page?.offset,
      take: options?.page?.limit,
    });
  },

  count(filter?: Record<string, string>): Promise<number> {
    const where = buildWhere(filter);

    return prisma.cliente.count({ where });
  },

  findById(id: number): Promise<Cliente | null> {
    return prisma.cliente.findUnique({ where: { id_cliente: id } });
  },

  create(data: Omit<Cliente, "id_cliente">): Promise<Cliente> {
    return prisma.cliente.create({ data });
  },

  update(id: number, data: Partial<Omit<Cliente, "id_cliente">>): Promise<Cliente> {
    return prisma.cliente.update({ where: { id_cliente: id }, data });
  },

  remove(id: number): Promise<Cliente> {
    return prisma.cliente.delete({ where: { id_cliente: id } });
  },
};
