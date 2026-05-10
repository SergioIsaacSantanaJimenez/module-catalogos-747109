import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { Domicilio, CreateDomicilioDTO } from "../models/types";
import { dbPut, dbGet, dbScan, dbUpdate, dbDelete } from "../services/dynamoService";
import { CONFIG } from "../utils/config";
import {
  buildResponse,
  buildError,
  validateTipoDireccion,
  normalizeTipoDireccion,
  validateRequired,
} from "../utils/validators";

const TABLE = CONFIG.TABLES.DOMICILIOS;

export async function createDomicilio(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body ?? "{}") as CreateDomicilioDTO;
    const missing = validateRequired(body as unknown as Record<string, unknown>, [
      "clienteId", "domicilio", "colonia", "municipio", "estado", "tipoDireccion",
    ]);
    if (missing.length > 0) return buildError(400, `Campos requeridos faltantes: ${missing.join(", ")}`);
    if (!validateTipoDireccion(body.tipoDireccion)) return buildError(400, 'tipoDireccion debe ser "FACTURACIÓN" o "ENVÍO"');

    const tipoDireccion = normalizeTipoDireccion(body.tipoDireccion);
    if (!tipoDireccion) return buildError(400, 'tipoDireccion debe ser "FACTURACIÓN" o "ENVÍO"');

    if (!(await dbGet(CONFIG.TABLES.CLIENTES, body.clienteId))) return buildError(404, "Cliente no encontrado");

    const now = new Date().toISOString();
    const domicilio: Domicilio = {
      id: uuidv4(),
      clienteId: body.clienteId,
      domicilio: body.domicilio.trim(),
      colonia: body.colonia.trim(),
      municipio: body.municipio.trim(),
      estado: body.estado.trim(),
      tipoDireccion,
      createdAt: now,
      updatedAt: now,
    };
    await dbPut(TABLE, domicilio as unknown as Record<string, unknown>);
    return buildResponse(201, domicilio);
  } catch (err) {
    console.error("createDomicilio error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function listDomicilios(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const clienteId = event.queryStringParameters?.clienteId;
    const items = await dbScan(TABLE);
    return buildResponse(200, clienteId ? items.filter((d) => d.clienteId === clienteId) : items);
  } catch (err) {
    console.error("listDomicilios error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function getDomicilio(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    const item = await dbGet(TABLE, id);
    if (!item) return buildError(404, "Domicilio no encontrado");
    return buildResponse(200, item);
  } catch (err) {
    console.error("getDomicilio error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function updateDomicilio(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    if (!(await dbGet(TABLE, id))) return buildError(404, "Domicilio no encontrado");

    const body = JSON.parse(event.body ?? "{}") as Partial<CreateDomicilioDTO>;
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.domicilio) updates.domicilio = body.domicilio.trim();
    if (body.colonia) updates.colonia = body.colonia.trim();
    if (body.municipio) updates.municipio = body.municipio.trim();
    if (body.estado) updates.estado = body.estado.trim();
    if (body.tipoDireccion) {
      if (!validateTipoDireccion(body.tipoDireccion)) return buildError(400, 'tipoDireccion debe ser "FACTURACIÓN" o "ENVÍO"');
      const tipoDireccion = normalizeTipoDireccion(body.tipoDireccion);
      if (!tipoDireccion) return buildError(400, 'tipoDireccion inválido');
      updates.tipoDireccion = tipoDireccion;
    }
    return buildResponse(200, await dbUpdate(TABLE, id, updates));
  } catch (err) {
    console.error("updateDomicilio error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function deleteDomicilio(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    if (!(await dbGet(TABLE, id))) return buildError(404, "Domicilio no encontrado");
    await dbDelete(TABLE, id);
    return buildResponse(200, { message: "Domicilio eliminado", id });
  } catch (err) {
    console.error("deleteDomicilio error:", err);
    return buildError(500, "Error interno del servidor");
  }
}
