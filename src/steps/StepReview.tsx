import { useMemo, useState } from 'react';
import { useContract } from '../context/ContractContext';

export default function StepReview() {
  const { apiInfo, resources } = useContract();

  const [copied, setCopied] = useState(false);
  const [spectralWarnings, setSpectralWarnings] = useState<string[] | null>(null);

  // Construye el contrato exportable
  const contract = useMemo(() => ({ apiInfo, resources }), [apiInfo, resources]);
  const contractJson = useMemo(() => JSON.stringify(contract, null, 2), [contract]);

  // Validaciones simples
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!apiInfo.name.trim()) errors.push('El nombre de la API es obligatorio.');
  if (!apiInfo.baseUrl.trim()) errors.push('La Base URL es obligatoria.');
  if (!/^https?:\/\/.+/i.test(apiInfo.baseUrl)) warnings.push('Base URL no parece válida (debe empezar con http:// o https://).');
  if (!apiInfo.type.trim()) warnings.push('El tipo/scope de la API está vacío.');

  resources.forEach((r, i) => {
    if (!r.name.trim()) errors.push(`Recurso #${i + 1}: el nombre es obligatorio.`);
    if (!r.name.trim().endsWith('s')) warnings.push(`Recurso "${r.name}" no está en plural.`);
    if (!r.identifier.trim()) errors.push(`Recurso "${r.name}": identificador obligatorio.`);
    try {
      if (r.model.trim()) JSON.parse(r.model);
    } catch {
      errors.push(`Recurso "${r.name}": modelo JSON inválido.`);
    }
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contractJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportContract = () => {
    const blob = new Blob([contractJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apiInfo.name || 'api-contract'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Placeholder: función simulada para Spectral
  const runSpectral = async () => {
    // Aquí podrías integrar @stoplight/spectral-core o hacer llamada al backend que lo corra.
    // Por ahora simulamos una advertencia ficticia si falta nombre.
    const simulated: string[] = [];
    if (!apiInfo.name) simulated.push('spectral: info.title is missing.');
    if (resources.length === 0) simulated.push('spectral: No resources defined.');
    setSpectralWarnings(simulated.length ? simulated : ['No issues detected by Spectral (simulado).']);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso Review: Revisión y Exportación</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel de validación */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Errores críticos</h3>
            {errors.length === 0 ? (
              <p className="text-green-700">No hay errores críticos.</p>
            ) : (
              <ul className="list-disc pl-5 text-red-600 space-y-1">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Advertencias</h3>
            {warnings.length === 0 ? (
              <p className="text-green-700">Sin advertencias.</p>
            ) : (
              <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={runSpectral}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Validar con Spectral (simulado)
            </button>
            <button onClick={exportContract} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Descargar JSON
            </button>
            <button
              onClick={handleCopy}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
            >
              {copied ? 'Copiado ✓' : 'Copiar al portapapeles'}
            </button>
          </div>

          {spectralWarnings && (
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium mb-1">Resultados Spectral</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {spectralWarnings.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Panel de vista previa JSON */}
        <div className="relative">
          <div className="bg-gray-800 text-white rounded-lg p-4 overflow-auto h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">Contrato JSON</span>
            </div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {contractJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}