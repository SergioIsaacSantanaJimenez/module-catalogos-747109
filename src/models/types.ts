export interface Cliente {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  rfc: string;
  correo: string;
  telefono: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDTO {
  razonSocial: string;
  nombreComercial: string;
  rfc: string;
  correo: string;
  telefono: string;
}

export type TipoDireccion = "FACTURACIÓN" | "ENVÍO";

export interface Domicilio {
  id: string;
  clienteId: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  estado: string;
  tipoDireccion: TipoDireccion;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDomicilioDTO {
  clienteId: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  estado: string;
  tipoDireccion: TipoDireccion;
}

export interface Producto {
  id: string;
  nombre: string;
  unidadMedida: string;
  precioBase: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoDTO {
  nombre: string;
  unidadMedida: string;
  precioBase: number;
}
