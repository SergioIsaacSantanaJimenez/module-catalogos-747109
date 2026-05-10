import { TipoDireccion } from "../models/types";

const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

export function validateRFC(rfc: string): boolean {
  return RFC_REGEX.test(rfc.toUpperCase());
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateTelefono(telefono: string): boolean {
  return /^\d{10}$/.test(telefono);
}

export function normalizeTipoDireccion(tipo: string): TipoDireccion | "" {
  const clean = tipo
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "");
  if (clean === "FACTURACION") return "FACTURACIÓN";
  if (clean === "ENVIO") return "ENVÍO";
  return "";
}

export function validateTipoDireccion(tipo: string): boolean {
  return normalizeTipoDireccion(tipo) !== "";
}

export function validateRequired(obj: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === "");
}

export function buildResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

export function buildError(statusCode: number, message: string) {
  return buildResponse(statusCode, { error: message });
}
