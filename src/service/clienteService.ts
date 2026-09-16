import { clienteRepository } from "../repository/clienteRepository";
import { CreateClienteInput, UpdateClienteInput } from "../domain/cliente";

export const clienteService = {
  async getAll() {
    return clienteRepository.findAll();
  },

  async getById(id: number) {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) {
      throw { status: 404, title: "Not Found", detail: `Cliente con id ${id} no encontrado` };
    }
    return cliente;
  },

  async create(data: CreateClienteInput) {
    return clienteRepository.create(data);
  },

  async update(id: number, data: UpdateClienteInput) {
    // Verifica que exista antes de actualizar
    await clienteService.getById(id);
    return clienteRepository.update(id, data);
  },

  async remove(id: number) {
    // Verifica que exista antes de eliminar
    await clienteService.getById(id);
    return clienteRepository.remove(id);
  },
};
