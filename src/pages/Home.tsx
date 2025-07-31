import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Diseñador de Contratos API</h1>
        <p className="text-gray-600">
          Herramienta para diseñar, validar y exportar contratos de APIs siguiendo buenas prácticas REST.
        </p>
        <button
          onClick={() => navigate('/wizard/api-info')}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Comenzar diseño
        </button>
      </div>
    </div>
  );
}