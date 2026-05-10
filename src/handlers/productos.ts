import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { Producto, CreateProductoDTO } from "../models/types";
import { dbPut, dbGet, dbScan, dbUpdate, dbDelete } from "../services/dynamoService";
import { CONFIG } from "../utils/config";
import { buildResponse, buildError, validateRequired } from "../utils/validators";

const TABLE = CONFIG.TABLES.PRODUCTOS;

export async function createProducto(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body ?? "{}") as CreateProductoDTO;
    const missing = validateRequired(body as unknown as Record<string, unknown>, ["nombre", "unidadMedida", "precioBase"]);
    if (missing.length > 0) return buildError(400, `Campos requeridos faltantes: ${missing.join(", ")}`);
    if (typeof body.precioBase !== "number" || body.precioBase <= 0) return buildError(400, "precioBase debe ser un número positivo");

    const now = new Date().toISOString();
    const producto: Producto = {
      id: uuidv4(),
      nombre: body.nombre.trim(),
      unidadMedida: body.unidadMedida.trim(),
      precioBase: body.precioBase,
      createdAt: now,
      updatedAt: now,
    };
    await dbPut(TABLE, producto as unknown as Record<string, unknown>);
    return buildResponse(201, producto);
  } catch (err) {
    console.error("createProducto error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function listProductos(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    return buildResponse(200, await dbScan(TABLE));
  } catch (err) {
    console.error("listProductos error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function getProducto(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    const item = await dbGet(TABLE, id);
    if (!item) return buildError(404, "Producto no encontrado");
    return buildResponse(200, item);
  } catch (err) {
    console.error("getProducto error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function updateProducto(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    if (!(await dbGet(TABLE, id))) return buildError(404, "Producto no encontrado");

    const body = JSON.parse(event.body ?? "{}") as Partial<CreateProductoDTO>;
    if (body.precioBase !== undefined && (typeof body.precioBase !== "number" || body.precioBase <= 0)) {
      return buildError(400, "precioBase debe ser un número positivo");
    }

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.nombre) updates.nombre = body.nombre.trim();
    if (body.unidadMedida) updates.unidadMedida = body.unidadMedida.trim();
    if (body.precioBase !== undefined) updates.precioBase = body.precioBase;

    return buildResponse(200, await dbUpdate(TABLE, id, updates));
  } catch (err) {
    console.error("updateProducto error:", err);
    return buildError(500, "Error interno del servidor");
  }
}

export async function deleteProducto(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return buildError(400, "ID requerido");
    if (!(await dbGet(TABLE, id))) return buildError(404, "Producto no encontrado");
    await dbDelete(TABLE, id);
    return buildResponse(200, { message: "Producto eliminado", id });
  } catch (err) {
    console.error("deleteProducto error:", err);
    return buildError(500, "Error interno del servidor");
  }
}
