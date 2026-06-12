# Módulo de Catálogos (Clientes, Domicilios, Productos)

Este proyecto es un módulo de API serverless desarrollado en TypeScript para la gestión de catálogos de `Clientes`, `Domicilios` y `Productos`. Proporciona una interfaz RESTful completa para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre estas entidades. La implementación está diseñada para funcionar como una función AWS Lambda, utilizando AWS API Gateway para manejar las solicitudes HTTP y AWS DynamoDB como base de datos NoSQL.

## Tecnologías Utilizadas

*   **TypeScript**: `v5.4.x`
*   **Node.js**: `v18` (ambiente de ejecución).
*   **AWS Lambda**: Para la ejecución de las funciones serverless.
*   **AWS API Gateway**: Implícito como el disparador de las funciones Lambda a través de rutas HTTP.
*   **AWS DynamoDB**: Como base de datos NoSQL para persistir la información de los catálogos.
    *   `@aws-sdk/client-dynamodb`: `^3.600.0`
    *   `@aws-sdk/lib-dynamodb`: `^3.600.0`
*   **UUID**: `^9.0.0` (para generación de identificadores únicos).
*   **npm**: Gestor de paquetes.
*   **Docker**: Para la contenerización de la aplicación.

## Prerrequisitos

*   Node.js (versión 18 o superior).
*   npm (incluido con Node.js).
*   (Opcional) Docker Desktop (para construir y ejecutar la imagen Docker).

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/SergioIsaacSantanaJimenez/module-catalogos-747109.git
    cd module-catalogos-747109
    ```
2.  Instala las dependencias del proyecto:
    ```bash
    npm ci
    ```

## Ejecución

### Compilación

Para compilar el proyecto en modo de observación (watch):
```bash
npm run build:watch
```

Para una compilación única:
```bash
npm run build
```

### Ejecución Local

Tras la compilación, la aplicación puede ser ejecutada con Node.js. *Nota: Para funcionar completamente, requeriría un entorno simulado de AWS Lambda y API Gateway (no incluido en el código explícitamente), ya que el `handler` espera eventos de `APIGatewayProxyEvent`.*
```bash
node dist/index.js
```

### Con Docker

1.  Construye la imagen Docker:
    ```bash
    docker build -t module-catalogos .
    ```
2.  Ejecuta el contenedor:
    ```bash
    docker run -p 8080:8080 module-catalogos
    ```
    La API estará disponible en `http://localhost:8080`.

## Estructura del Proyecto

*   `package.json`: Metadatos del proyecto y definición de dependencias.
*   `tsconfig.json`: Configuración del compilador TypeScript.
*   `Dockerfile`: Definición para la construcción de la imagen Docker de la aplicación.
*   `src/`: Directorio principal del código fuente.
    *   `src/index.ts`: Punto de entrada de la aplicación, actúa como el manejador principal de AWS Lambda, enrutando las solicitudes de API Gateway a las funciones manejadoras específicas.
    *   `src/handlers/`: Contiene la lógica de negocio y las funciones CRUD para cada entidad.
        *   `src/handlers/clientes.ts`: Funciones para la gestión de clientes.
        *   `src/handlers/domicilios.ts`: Funciones para la gestión de domicilios (incluye validación de campos y manejo de lógica de negocio).
        *   `src/handlers/productos.ts`: Funciones para la gestión de productos.
    *   `src/models/types.ts`: (Inferido) Define las interfaces de datos (ej. `Domicilio`, `CreateDomicilioDTO`) utilizadas en la aplicación.
    *   `src/services/dynamoService.ts`: (Inferido) Módulo que encapsula las interacciones con AWS DynamoDB (ej. `dbPut`, `dbGet`, `dbScan`, `dbUpdate`, `dbDelete`).
    *   `src/utils/config.ts`: (Inferido) Contiene configuraciones globales, como los nombres de las tablas de DynamoDB.
    *   `src/utils/validators.ts`: (Inferido) Provee utilidades para la validación de la entrada del usuario y la construcción estandarizada de respuestas HTTP y errores.

## Habilidades Técnicas Demostradas

*   **Desarrollo Serverless**: Construcción de APIs RESTful utilizando AWS Lambda y su integración con AWS API Gateway.
*   **Programación con TypeScript**: Uso de tipado estático para mejorar la robustez, legibilidad y mantenibilidad del código.
*   **Interacción con Bases de Datos NoSQL**: Manejo de AWS DynamoDB a través del AWS SDK para realizar operaciones CRUD.
*   **Diseño de APIs RESTful**: Implementación de rutas HTTP (GET, POST, PUT, DELETE) para la gestión de recursos de manera estándar.
*   **Validación de Entrada y Manejo de Errores**: Implementación de lógica de validación de datos de entrada y respuestas de error consistentes y bien estructuradas.
*   **Contenerización con Docker**: Creación de un `Dockerfile` optimizado para construir una imagen de producción de la aplicación Node.js/TypeScript.
*   **Organización y Estructura de Proyectos**: Demostración de una estructura de proyecto modular y escalable para aplicaciones backend.
*   **Manejo de Dependencias**: Gestión de paquetes y versiones con `npm`.