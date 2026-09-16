import { PrismaClient } from "@prisma/client";
import { Cliente, CreateClienteInput, UpdateClienteInput } from "../domain/cliente";

const prisma = new PrismaClient();

export const clienteRepository = {
  findAll(): Promise<Cliente[]> {
    return prisma.cliente.findMany();
  },

  findById(id: number): Promise<Cliente | null> {
    return prisma.cliente.findUnique({ where: { id_cliente: id } });
  },

  create(data: CreateClienteInput): Promise<Cliente> {
    return prisma.cliente.create({ data });
  },

  update(id: number, data: UpdateClienteInput): Promise<Cliente> {
    return prisma.cliente.update({ where: { id_cliente: id }, data });
  },

  remove(id: number): Promise<Cliente> {
    return prisma.cliente.delete({ where: { id_cliente: id } });
  },
};
