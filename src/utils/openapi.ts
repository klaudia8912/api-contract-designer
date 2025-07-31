// src/utils/openapi.ts
import type { ApiContract, Operation } from '../types/contract';

export function buildOpenApi(contract: ApiContract) {
  const paths: Record<string, any> = {};

  for (const [resourceName, ops] of Object.entries(contract.operations || {})) {
    ops.forEach((op: Operation) => {
      const fullPath = op.path.startsWith('/') ? op.path : `/${op.path}`;

      if (!paths[fullPath]) paths[fullPath] = {};

      const methodKey = op.method.toLowerCase();

      const parameters = (op.parameters || []).map((p) => ({
        name: p.name,
        in: p.in,
        required: p.required,
        schema: {
          type: p.schema,
        },
      }));

      const requestBody = op.requestBody
        ? {
            content: {
              [op.requestBody.contentType]: {
                schema: safeParseSchema(op.requestBody.schema),
              },
            },
          }
        : undefined;

      const responses = (op.responses || []).reduce((acc, resp) => {
        acc[resp.statusCode] = {
          description: '',
          content: {
            [resp.contentType]: {
              schema: safeParseSchema(resp.bodySchema),
            },
          },
        };
        return acc;
      }, {} as Record<string, any>);

      paths[fullPath][methodKey] = {
        operationId: op.operationId,
        description: op.description || '',
        parameters: parameters.length ? parameters : undefined,
        requestBody,
        responses: Object.keys(responses).length ? responses : { '200': { description: 'OK' } },
      };
    });
  }

  return {
    openapi: '3.0.3',
    info: {
      title: contract.apiInfo.name || 'API',
      version: contract.apiInfo.version,
      description: contract.apiInfo.description || '',
    },
    servers: [
      {
        url: contract.apiInfo.baseUrl || '',
      },
    ],
    paths,
    components: {
      // Aquí se podrían inyectar schemas derivados de recursos si se desea
    },
  };
}

// intenta parsear JSON, si falla devuelve objeto vacío
function safeParseSchema(schema: string) {
  try {
    return JSON.parse(schema);
  } catch {
    return {};
  }
}