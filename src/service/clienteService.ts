import { clienteRepository, QueryOptions } from "../repository/clienteRepository";
import { CreateClienteInput, UpdateClienteInput, createClienteSchema, updateClienteSchema } from "../domain/cliente";
import { ZodError } from "zod";

export const clienteService = {
  async getAll(options?: QueryOptions) {
    return clienteRepository.findAll(options);
  },

  async count(filter?: Record<string, string>) {
    return clienteRepository.count(filter);
  },

  async getById(id: number) {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) {
      throw { status: 404, title: "Not Found", detail: `Cliente con id ${id} no encontrado` };
    }
    return cliente;
  },

  async create(data: CreateClienteInput) {
    // Validación con Zod
    const parsed = createClienteSchema.parse(data);
    return clienteRepository.create(parsed);
  },

  async update(id: number, data: UpdateClienteInput) {
    // Verifica que exista antes de actualizar
    await clienteService.getById(id);
    // Validación con Zod
    const parsed = updateClienteSchema.parse(data);
    return clienteRepository.update(id, parsed);
  },

  async remove(id: number) {
    // Verifica que exista antes de eliminar
    await clienteService.getById(id);
    return clienteRepository.remove(id);
  },
};
