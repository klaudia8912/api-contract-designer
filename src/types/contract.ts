// src/types/contract.ts
export interface ApiInfo {
    name: string;
    type: string;
    version: string;
    baseUrl: string;
    description?: string;
  }
  
  export interface Resource {
    name: string;
    identifier: string;
    model: string;
    associations?: string;
  }
  
  export interface Parameter {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    required: boolean;
    schema: string;
  }
  
  export interface RequestBody {
    contentType: string;
    schema: string;
  }
  
  export interface Response {
    statusCode: string;
    contentType: string;
    bodySchema: string;
  }
  
  export interface ErrorDef {
    code: string;
    message: string;
    schema?: string;
  }
  
  export interface Operation {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    operationId: string;
    description?: string;
    parameters: Parameter[];
    requestBody?: RequestBody;
    responses: Response[];
    errors: ErrorDef[];
    filters: boolean;
    pagination: boolean;
    sorting: boolean;
  }
  
  export interface ApiContract {
    apiInfo: ApiInfo;
    resources: Resource[];
    operations?: Record<string, Operation[]>;
  }