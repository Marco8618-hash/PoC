export class Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;

  constructor(id_cliente: number, nombre: string, apellido: string, dni: string, email: string) {
    this.id_cliente = id_cliente;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.email = email;
  }
}

export type CreateClienteInput = Omit<Cliente, "id_cliente">;
export type UpdateClienteInput = Partial<CreateClienteInput>;
