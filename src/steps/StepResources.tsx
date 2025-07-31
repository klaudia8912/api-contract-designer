import { useState } from 'react';
import { useContract } from '../context/ContractContext';


export default function StepResources() {
  const { resources, addResource } = useContract();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [model, setModel] = useState('');

  const handleAdd = () => {
    if (!name || !identifier) return;
    addResource({ name, identifier, model, associations: '' });
    setName('');
    setIdentifier('');
    setModel('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso 2: Recursos</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block font-medium text-sm text-gray-700">Nombre (plural)</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium text-sm text-gray-700">Identificador</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Modelo (JSON)</label>
        <textarea
          className="mt-1 w-full border rounded-lg px-3 py-2 font-mono"
          rows={4}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <div>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
        >
          Agregar recurso
        </button>
      </div>

      {resources.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Recursos agregados</h3>
          <ul className="list-disc pl-5 space-y-1">
            {resources.map((r, i) => (
              <li key={i}>
                <strong>{r.name}</strong> — ID: <code>{r.identifier}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}