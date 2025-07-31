import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Diseñador de Contratos API</h1>
          <nav className="space-x-4">
            <Link to="/api-info" className="text-blue-600 hover:underline">
              Paso 1
            </Link>
            <Link to="/resources" className="text-blue-600 hover:underline">
              Paso 2
            </Link>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}