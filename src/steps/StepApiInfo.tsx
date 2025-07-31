import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../context/ContractContext';

function extractMajor(version: string) {
  return version.split('.')[0];
}

export default function StepApiInfo() {
  const navigate = useNavigate();
  const { apiInfo, setApiInfo } = useContract();

  const [local, setLocal] = useState({
    name: apiInfo.name,
    description: (apiInfo as any).description || '',
    scope: apiInfo.type,
    baseUrl: apiInfo.baseUrl,
    version: apiInfo.version,
  });
  const [errors, setErrors] = useState<{ baseUrl?: string; version?: string }>({});

  useEffect(() => {
    setLocal({
      name: apiInfo.name,
      description: (apiInfo as any).description || '',
      scope: apiInfo.type,
      baseUrl: apiInfo.baseUrl,
      version: apiInfo.version,
    });
  }, [apiInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocal((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!/^https?:\/\/.+/i.test(local.baseUrl)) {
      newErrors.baseUrl = 'URL inválida (debe comenzar con http:// o https://)';
    } else {
      const major = extractMajor(local.version);
      const expectedSegment = `/v${major}`;
      if (!local.baseUrl.includes(expectedSegment)) {
        newErrors.baseUrl = `Base URL debe incluir el segmento de versión '${expectedSegment}' según la versión indicada (${local.version}).`;
      }
    }

    if (!/^\d+\.\d+\.\d+$/.test(local.version)) {
      newErrors.version = 'Versión inválida, debe ser semántica (ej. 1.0.0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setApiInfo({
      name: local.name,
      type: local.scope,
      version: local.version,
      baseUrl: local.baseUrl,
      description: local.description,
    });
    navigate('/wizard/resources');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso 1: Información general de la API</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-medium text-sm text-gray-700">Nombre de la API</label>
          <input
            type="text"
            name="name"
            value={local.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={local.description}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block font-medium text-sm text-gray-700">Scope</label>
            <select
              name="scope"
              value={local.scope}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="public">Pública</option>
              <option value="internal">Interna</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Versión</label>
            <input
              type="text"
              name="version"
              value={local.version}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.version ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="1.0.0"
            />
            {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
          </div>
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Base URL</label>
          <input
            type="text"
            name="baseUrl"
            value={local.baseUrl}
            onChange={handleChange}
            className={`mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.baseUrl ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            placeholder="https://api.ejemplo.com/v1"
          />
          {errors.baseUrl && <p className="text-red-500 text-sm mt-1">{errors.baseUrl}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl transition"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}