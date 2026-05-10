export const CONFIG = {
  REGION: process.env.AWS_REGION || "us-east-2",
  TABLES: {
    CLIENTES: process.env.TABLE_CLIENTES || "clientes",
    DOMICILIOS: process.env.TABLE_DOMICILIOS || "domicilios",
    PRODUCTOS: process.env.TABLE_PRODUCTOS || "productos",
  },
};
