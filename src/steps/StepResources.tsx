import { useState } from 'react';
import { useContract } from '../context/ContractContext';
import type { Resource } from '../types/contract';
import { useNavigate } from 'react-router-dom';

interface EditableResource extends Resource {
  isEditing?: boolean;
}

export default function StepResources() {
  const { resources, addResource } = useContract();
  const navigate = useNavigate();

  const [localResources, setLocalResources] = useState<EditableResource[]>(
    resources.map((r) => ({ ...r, isEditing: false }))
  );
  const [form, setForm] = useState({
    name: '',
    identifier: '',
    model: '',
    associations: '',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetForm = () => setForm({ name: '', identifier: '', model: '', associations: '' });

  const handleAddOrUpdate = () => {
    if (!form.name.trim() || !form.identifier.trim()) return;

    if (editingIndex !== null) {
      // actualizar existente
      setLocalResources((prev) => {
        const updated = [...prev];
        updated[editingIndex] = { ...form, isEditing: false };
        return updated;
      });
      setEditingIndex(null);
      resetForm();
    } else {
      // nuevo
      const newRes: EditableResource = { ...form };
      setLocalResources((prev) => [...prev, newRes]);
      addResource(newRes);
      resetForm();
    }
  };

  const startEdit = (idx: number) => {
    const r = localResources[idx];
    setForm({ name: r.name, identifier: r.identifier, model: r.model, associations: r.associations || '' });
    setEditingIndex(idx);
  };

  const handleDelete = (idx: number) => {
    setLocalResources((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleView = (r: EditableResource) => {
    alert(`Recurso: ${r.name}\nIdentificador: ${r.identifier}\nModelo: ${r.model}\nAsociaciones: ${r.associations}`);
  };

  // Sync context if localResources changed (simple replace)
  const syncToContext = () => {
    // Limpiamos y re-agregamos para simplificar (podrías mejorar con setResources)
    localResources.forEach((r) => addResource(r));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso 2: Definición de recursos</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario crear/editar */}
        <div className="space-y-4 bg-white rounded-lg shadow p-4">
          <div>
            <label className="block font-medium text-sm text-gray-700">Nombre del recurso (plural)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="usuarios"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Identificador</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.identifier}
              onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
              placeholder="id"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Modelo (JSON)</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 font-mono"
              rows={4}
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder='{"id":"string","nombre":"string"}'
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Asociaciones</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={2}
              value={form.associations}
              onChange={(e) => setForm((f) => ({ ...f, associations: e.target.value }))}
              placeholder="Un usuario tiene múltiples órdenes"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {editingIndex !== null ? 'Actualizar recurso' : 'Agregar recurso'}
            </button>
            {editingIndex !== null && (
              <button
                onClick={() => {
                  resetForm();
                  setEditingIndex(null);
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Lista de recursos */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h3 className="font-semibold">Recursos definidos</h3>
          {localResources.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay recursos agregados aún.</p>
          ) : (
            <ul className="space-y-2">
              {localResources.map((r, i) => (
                <li key={i} className="border rounded p-3 flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-medium">{r.name}</span>
                    <small>ID: {r.identifier}</small>
                    {r.associations && <small className="text-gray-500">Asoc: {r.associations}</small>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(r)}
                      className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => startEdit(i)}
                      className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-sm px-2 py-1 border rounded hover:bg-red-100 text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={() => navigate('/wizard/api-info')} className="text-gray-600 underline">
          ← Volver
        </button>
        <button
          onClick={() => {
            syncToContext();
            navigate('/wizard/operations');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Siguiente: Operaciones →
        </button>
      </div>
    </div>
  );
}