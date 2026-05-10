import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildError } from "./utils/validators";
import { createCliente, listClientes, getCliente, updateCliente, deleteCliente } from "./handlers/clientes";
import { createDomicilio, listDomicilios, getDomicilio, updateDomicilio, deleteDomicilio } from "./handlers/domicilios";
import { createProducto, listProductos, getProducto, updateProducto, deleteProducto } from "./handlers/productos";

type RouteHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

const routes: Record<string, RouteHandler> = {
  "GET /clientes":         listClientes,
  "POST /clientes":        createCliente,
  "GET /clientes/{id}":    getCliente,
  "PUT /clientes/{id}":    updateCliente,
  "DELETE /clientes/{id}": deleteCliente,

  "GET /domicilios":         listDomicilios,
  "POST /domicilios":        createDomicilio,
  "GET /domicilios/{id}":    getDomicilio,
  "PUT /domicilios/{id}":    updateDomicilio,
  "DELETE /domicilios/{id}": deleteDomicilio,

  "GET /productos":         listProductos,
  "POST /productos":        createProducto,
  "GET /productos/{id}":    getProducto,
  "PUT /productos/{id}":    updateProducto,
  "DELETE /productos/{id}": deleteProducto,
};

function normalizePath(path: string): string {
  return path.replace(
    /\/(clientes|domicilios|productos)\/([^/]+)/,
    (_, resource) => `/${resource}/{id}`
  );
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: "",
    };
  }

  const routeKey = `${event.httpMethod} ${normalizePath(event.path)}`;
  const handlerFn = routes[routeKey];
  if (!handlerFn) return buildError(404, `Ruta no encontrada: ${event.httpMethod} ${event.path}`);
  return handlerFn(event);
};
