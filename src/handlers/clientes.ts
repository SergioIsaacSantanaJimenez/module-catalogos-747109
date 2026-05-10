import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { Cliente, CreateClienteDTO } from "../models/types";
import { dbPut, dbGet, dbScan, dbUpdate, dbDelete } from "../services/dynamoService";
import { CONFIG } from "../utils/config";
import {
  buildResponse,
  buildError,
  validateRFC,
  validateEmail,
  validateTelefono,
  validateRequired,
} from "../utils/validators";

const TABLE = CONFIG.TABLES.CLIENTES;

export async function createCliente(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body ?? "{}") as CreateClienteDTO;
    const missing = validateRequired(body as unknown as Record<string, unknown>, [
      "razonSocial", "nombreComercial", "rfc", "correo", "telefono",
    ]);
    if (missing.length > 0) return buildError(400, `Campos requeridos faltantes: ${missing.join(", ")}`);
    if (!validateRFC(body.rfc)) return buildError(400, "RFC inválido. Formato: XXXX######XXX");
    if (!validateEmail(body.correo)) return buildError(400, "Correo electrónico inválido");
    if (!validateTelefono(body.telefono)) return buildError(400, "Teléfono inválido. Debe tener 10 dígitos");

    const now = new Date().toISOString();
    const cliente: Cliente = {
      id: uuidv4(),
      razonSocial: body.razonSocial.trim(),
      nombreComercial: body.nombreComercial.trim(),
      rfc: body.rfc.toUpperCase().trim(),
      correo: body.correo.toLowerCase().trim(),
      telefono: body.telefono.trim(),
      createdAt: now,
      updatedAt: now,
    };
    await dbPut(TABLE, cliente as unknown as Record<string, unknown>);
    return buildResponse(201, cliente);
  } catch (err) {
    console.error("createCliente error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function listClientes(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    return buildResponse(200, await dbScan(TABLE));
  } catch (err) {
    console.error("listClientes error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function getCliente(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    const item = await dbGet(TABLE, id);
    if (!item) return buildError(404, "Cliente no encontrado");
    return buildResponse(200, item);
  } catch (err) {
    console.error("getCliente error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function updateCliente(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    if (!(await dbGet(TABLE, id))) return buildError(404, "Cliente no encontrado");

    const body = JSON.parse(event.body ?? "{}") as Partial<CreateClienteDTO>;
    if (body.rfc && !validateRFC(body.rfc)) return buildError(400, "RFC inválido");
    if (body.correo && !validateEmail(body.correo)) return buildError(400, "Correo inválido");
    if (body.telefono && !validateTelefono(body.telefono)) return buildError(400, "Teléfono inválido");

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.razonSocial) updates.razonSocial = body.razonSocial.trim();
    if (body.nombreComercial) updates.nombreComercial = body.nombreComercial.trim();
    if (body.rfc) updates.rfc = body.rfc.toUpperCase().trim();
    if (body.correo) updates.correo = body.correo.toLowerCase().trim();
    if (body.telefono) updates.telefono = body.telefono.trim();

    return buildResponse(200, await dbUpdate(TABLE, id, updates));
  } catch (err) {
    console.error("updateCliente error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function deleteCliente(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    if (!(await dbGet(TABLE, id))) return buildError(404, "Cliente no encontrado");
    await dbDelete(TABLE, id);
    return buildResponse(200, { message: "Cliente eliminado", id });
  } catch (err) {
    console.error("deleteCliente error:", err);
    return buildError(500, "Error interno del servidor");
  }
}
