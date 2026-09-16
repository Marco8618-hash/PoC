import { z } from "zod";

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

// ─── Validación con Zod ─────────────────────────────────────────────────────

export const createClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  dni: z.string().regex(/^\d{7,9}$/, "El DNI debe tener entre 7 y 9 dígitos"),
  email: z.string().email("El email no tiene un formato válido"),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

