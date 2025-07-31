import { useState } from 'react';
import { useContract } from '../context/ContractContext';
import type { Operation, Parameter, RequestBody, Response, ErrorDef } from '../types/contract';
import { useNavigate } from 'react-router-dom';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

function checkPathComplexity(path: string) {
  const segments = path.split('/').filter(Boolean);
  return segments.length > 3;
}

export default function StepOperations() {
  const navigate = useNavigate();
  const { resources, operations, addOperation, updateOperation, removeOperation } = useContract();

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

  const handleAddParam = () => {
    const newParam: Parameter = {
      name: 'id',
      in: 'path',
      required: true,
      schema: 'string',
    };
    setCurrentOp((prev) => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParam],
    }));
  };

  const handleAddResponse = () => {
    const newResp: Response = {
      statusCode: '200',
      contentType: 'application/json',
      bodySchema: '{}',
    };
    setCurrentOp((prev) => ({
      ...prev,
      responses: [...(prev.responses || []), newResp],
    }));
  };

  const handleAddError = () => {
    const newErr: ErrorDef = {
      code: '400',
      message: 'Error genérico',
    };
    setCurrentOp((prev) => ({
      ...prev,
      errors: [...(prev.errors || []), newErr],
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

    addOperation(selectedResource, op);
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
  };

  const handleEditOperation = (index: number) => {
    if (!selectedResource) return;
    const existing = operations[selectedResource] || [];
    const op = existing[index];
    updateOperation(selectedResource, index, op);
  };

  const existingOps = operations[selectedResource] || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso 3: Operaciones por recurso</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lista de recursos y sus operaciones */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700">Recurso</label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            >
              {resources.map((r) => (
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
                    <div>
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
                        onClick={() => {
                          setCurrentOp(op);
                        }}
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

        {/* Formulario nueva operación */}
        <div className="space-y-4 bg-white p-4 rounded-lg shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-medium text-sm text-gray-700">Método</label>
              <select
                value={currentOp.method}
                onChange={(e) => setCurrentOp((prev) => ({ ...prev, method: e.target.value as any }))}
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

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveOperation}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
            >
              Agregar operación
            </button>
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