import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StepApiInfo() {
  const navigate = useNavigate();

  const [apiInfo, setApiInfo] = useState({
    name: '',
    description: '',
    scope: '',
    baseUrl: '',
  });

  const [errors, setErrors] = useState<{ baseUrl?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApiInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!/^https?:\/\/.+/i.test(apiInfo.baseUrl)) {
      newErrors.baseUrl = 'URL inválida (debe comenzar con http:// o https://)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    navigate('/resources');
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
            value={apiInfo.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={apiInfo.description}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Scope</label>
          <select
            name="scope"
            value={apiInfo.scope}
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
          <label className="block font-medium text-sm text-gray-700">Base URL</label>
          <input
            type="text"
            name="baseUrl"
            value={apiInfo.baseUrl}
            onChange={handleChange}
            className={`mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.baseUrl ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
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