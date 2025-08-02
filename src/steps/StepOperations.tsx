// src/steps/StepOperations.tsx
import { useState, useEffect, useCallback } from 'react';
import { useContract } from '../context/ContractContext';
import type {
  Operation,
  Parameter,
  RequestBody,
  Response,
  ErrorDef,
  Resource,
} from '../types/contract';
import { useNavigate } from 'react-router-dom';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

function checkPathComplexity(path: string) {
  const segments = path.split('/').filter(Boolean);
  return segments.length > 3;
}

function extractPathParams(path: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const params: string[] = [];
  let match;
  while ((match = regex.exec(path)) !== null) {
    params.push(match[1]);
  }
  return params;
}

function toCamelCase(str: string) {
  return str
    .replace(/[-_ ]+(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^\w/, (c) => c.toLowerCase());
}

function suggestOperationId(
  method: string,
  resourceName: string,
  pathParams: string[],
  path: string
) {
  // simplifica resource a singular (muy básico)
  let base = resourceName;
  if (base.endsWith('s')) base = base.slice(0, -1);
  const methodLower = method.toLowerCase();

  if (pathParams.length) {
    const byPart = pathParams
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('And');
    return toCamelCase(`${methodLower}_${base}_by_${byPart}`);
  }

  // si es colección (sin params) y es GET -> list
  if (method === 'GET') {
    return toCamelCase(`list_${resourceName}`);
  }

  return toCamelCase(`${methodLower}_${base}`);
}

export default function StepOperations() {
  const navigate = useNavigate();
  const {
    resources,
    operations,
    addOperation,
    updateOperation,
    removeOperation,
  } = useContract();

  const [selectedResource, setSelectedResource] = useState<string>(resources[0]?.name || '');
  const [currentOp, setCurrentOp] = useState<Partial<Operation>>({
    method: 'GET',
    path: '',
    operationId: '',
    parameters: [],
    responses: [],
    errors: [],
    filters: false,
    pagination: false,
    sorting: false,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Sync selectedResource when resources change
  useEffect(() => {
    if (!selectedResource && resources.length) {
      setSelectedResource(resources[0].name);
    }
  }, [resources, selectedResource]);

  // When path or method or resource changes, auto-infer path params and operationId if empty or not editing
  useEffect(() => {
    if (!currentOp.path) return;

    const pathParams = extractPathParams(currentOp.path);
    setCurrentOp((prev) => {
      // infer path parameters: add missing required path params
      const existingParams = prev.parameters || [];
      const inferred: Parameter[] = [...existingParams];

      pathParams.forEach((p) => {
        if (!existingParams.find((ep) => ep.name === p && ep.in === 'path')) {
          inferred.push({
            name: p,
            in: 'path',
            required: true,
            schema: 'string',
          });
        }
      });

      // remove path params that no longer exist
      const filtered = inferred.filter((param) => {
        if (param.in === 'path') {
          return pathParams.includes(param.name);
        }
        return true;
      });

      // suggest operationId only if not editing existing or user hasn't overridden
      let suggestedId = prev.operationId || '';
      if (editingIndex === null) {
        const opId = suggestOperationId(
          prev.method || 'get',
          selectedResource,
          pathParams,
          prev.path || ''
        );
        suggestedId = opId;
      }

      return {
        ...prev,
        parameters: filtered,
        operationId: suggestedId,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOp.path, currentOp.method, selectedResource]);

  const existingOps = operations[selectedResource] || [];

  const handleAddParam = () => {
    setCurrentOp((prev) => ({
      ...prev,
      parameters: [
        ...(prev.parameters || []),
        {
          name: 'newParam',
          in: 'query',
          required: false,
          schema: 'string',
        } as Parameter,
      ],
    }));
  };

  const handleAddResponse = () => {
    setCurrentOp((prev) => ({
      ...prev,
      responses: [
        ...(prev.responses || []),
        {
          statusCode: '200',
          contentType: 'application/json',
          bodySchema: '{}',
        } as Response,
      ],
    }));
  };

  const handleAddError = () => {
    setCurrentOp((prev) => ({
      ...prev,
      errors: [
        ...(prev.errors || []),
        {
          code: '400',
          message: 'Error genérico',
        } as ErrorDef,
      ],
    }));
  };

  const handleSaveOperation = () => {
    if (!selectedResource) return;
    if (!currentOp.method || !currentOp.path || !currentOp.operationId) return;

    const op: Operation = {
      method: currentOp.method as Operation['method'],
      path: currentOp.path!,
      operationId: currentOp.operationId!,
      description: currentOp.description || '',
      parameters: currentOp.parameters || [],
      requestBody: currentOp.requestBody as RequestBody | undefined,
      responses: currentOp.responses || [],
      errors: currentOp.errors || [],
      filters: !!currentOp.filters,
      pagination: !!currentOp.pagination,
      sorting: !!currentOp.sorting,
    };

    if (editingIndex !== null) {
      updateOperation(selectedResource, editingIndex, op);
    } else {
      addOperation(selectedResource, op);
    }

    // reset
    setCurrentOp({
      method: 'GET',
      path: '',
      operationId: '',
      parameters: [],
      responses: [],
      errors: [],
      filters: false,
      pagination: false,
      sorting: false,
    });
    setEditingIndex(null);
  };

  const startEdit = (idx: number) => {
    const op = existingOps[idx];
    setCurrentOp({ ...op });
    setEditingIndex(idx);
  };

  const cancelEdit = () => {
    setCurrentOp({
      method: 'GET',
      path: '',
      operationId: '',
      parameters: [],
      responses: [],
      errors: [],
      filters: false,
      pagination: false,
      sorting: false,
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso 3: Operaciones por recurso</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Selección de recurso y lista de operaciones */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700">Recurso</label>
            <select
              value={selectedResource}
              onChange={(e) => {
                setSelectedResource(e.target.value);
                setEditingIndex(null);
                setCurrentOp({
                  method: 'GET',
                  path: '',
                  operationId: '',
                  parameters: [],
                  responses: [],
                  errors: [],
                  filters: false,
                  pagination: false,
                  sorting: false,
                });
              }}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            >
              {resources.map((r: Resource) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Operaciones existentes</h3>
            {existingOps.length ? (
              <ul className="space-y-2">
                {existingOps.map((op, idx) => (
                  <li key={idx} className="border p-2 rounded flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-medium">{op.method}</span>
                        <code>{op.path}</code> — <span>{op.operationId}</span>
                      </div>
                      {op.description && <p className="text-sm text-gray-600">{op.description}</p>}
                      {checkPathComplexity(op.path) && (
                        <p className="text-yellow-600 text-xs mt-1">URL compleja (más de 3 segmentos)</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => startEdit(idx)}
                        className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeOperation(selectedResource, idx)}
                        className="text-sm px-2 py-1 border rounded hover:bg-red-100 text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No hay operaciones para este recurso aún.</p>
            )}
          </div>
        </div>

        {/* Formulario de operación */}
        <div className="space-y-4 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <label className="block font-medium text-sm text-gray-700">Método</label>
              <select
                value={currentOp.method}
                onChange={(e) =>
                  setCurrentOp((prev) => ({ ...prev, method: e.target.value as any }))
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-sm text-gray-700">Path relativo</label>
              <input
                type="text"
                value={currentOp.path || ''}
                onChange={(e) => setCurrentOp((prev) => ({ ...prev, path: e.target.value }))}
                placeholder="/{id}"
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
              {currentOp.path && checkPathComplexity(currentOp.path) && (
                <p className="text-yellow-600 text-xs mt-1">
                  La URL es compleja (más de 3 segmentos). Considera simplificar.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">operationId</label>
            <input
              type="text"
              value={currentOp.operationId || ''}
              onChange={(e) => setCurrentOp((prev) => ({ ...prev, operationId: e.target.value }))}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="obtenerUsuarios"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Descripción</label>
            <input
              type="text"
              value={currentOp.description || ''}
              onChange={(e) => setCurrentOp((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div>
              <label className="block font-medium text-sm text-gray-700">Filtros</label>
              <input
                type="checkbox"
                checked={!!currentOp.filters}
                onChange={(e) => setCurrentOp((prev) => ({ ...prev, filters: e.target.checked }))}
                className="ml-1"
              />
            </div>
            <div>
              <label className="block font-medium text-sm text-gray-700">Paginación</label>
              <input
                type="checkbox"
                checked={!!currentOp.pagination}
                onChange={(e) => setCurrentOp((prev) => ({ ...prev, pagination: e.target.checked }))}
                className="ml-1"
              />
            </div>
            <div>
              <label className="block font-medium text-sm text-gray-700">Ordenamiento</label>
              <input
                type="checkbox"
                checked={!!currentOp.sorting}
                onChange={(e) => setCurrentOp((prev) => ({ ...prev, sorting: e.target.checked }))}
                className="ml-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddParam}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              type="button"
            >
              + Parámetro
            </button>
            <button
              onClick={handleAddResponse}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              type="button"
            >
              + Response
            </button>
            <button
              onClick={handleAddError}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              type="button"
            >
              + Error
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={handleSaveOperation}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
            >
              {editingIndex !== null ? 'Actualizar operación' : 'Agregar operación'}
            </button>
            {editingIndex !== null && (
              <button
                onClick={cancelEdit}
                className="bg-gray-300 px-5 py-2 rounded"
                type="button"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={() => navigate('/wizard/resources')} className="text-gray-600 underline">
          ← Volver
        </button>
        <button
          onClick={() => navigate('/wizard/review')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Siguiente: Review →
        </button>
      </div>
    </div>
  );
}