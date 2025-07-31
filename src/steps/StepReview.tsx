import { useMemo, useState } from 'react';
import { useContract } from '../context/ContractContext';
import { buildOpenApi } from '../utils/openapi';
import yaml from 'js-yaml';

export default function StepReview() {
  const { apiInfo, resources, operations } = useContract();

  const [copied, setCopied] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [spectralWarnings, setSpectralWarnings] = useState<string[] | null>(null);

  const contract = useMemo(() => ({ apiInfo, resources, operations }), [apiInfo, resources, operations]);
  const contractJson = useMemo(() => JSON.stringify(contract, null, 2), [contract]);

  const openApiSpec = useMemo(() => buildOpenApi(contract as any), [contract]);
  const openApiJson = useMemo(() => JSON.stringify(openApiSpec, null, 2), [openApiSpec]);
  const openApiYaml = useMemo(() => yaml.dump(openApiSpec), [openApiSpec]);

  const copyContract = async () => {
    await navigator.clipboard.writeText(contractJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copySpec = async () => {
    await navigator.clipboard.writeText(openApiYaml);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 1500);
  };

  const exportSpec = () => {
    const blob = new Blob([openApiYaml], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apiInfo.name || 'api-spec'}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validaciones simples (como ya tenías)
  // ...

  const runSpectral = async () => {
    // Aquí podrías integrar @stoplight/spectral-core usando openApiSpec directamente.
    // Por ahora simulamos:
    const simulated: string[] = [];
    if (!apiInfo.name) simulated.push('spectral: info.title is missing.');
    if (!Object.keys(operations || {}).length) simulated.push('spectral: No operations defined.');
    setSpectralWarnings(simulated.length ? simulated : ['No issues detected by Spectral (simulado).']);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso Review: Revisión y Exportación</h2>

      {/* ... tu layout de errores/advertencias anteriores ... */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Spec OpenAPI */}
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Spec OpenAPI</h3>
            <div className="flex gap-2">
              <button
                onClick={copySpec}
                className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
              >
                {copiedSpec ? 'YAML copiado ✓' : 'Copiar YAML'}
              </button>
              <button
                onClick={exportSpec}
                className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
              >
                Descargar YAML
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-2 font-medium">YAML</div>
              <pre className="bg-gray-900 text-white rounded p-2 overflow-auto text-xs max-h-[300px]">
                {openApiYaml}
              </pre>
            </div>
            <div className="flex-1">
              <div className="mb-2 font-medium">JSON</div>
              <pre className="bg-gray-800 text-white rounded p-2 overflow-auto text-xs max-h-[300px]">
                {openApiJson}
              </pre>
            </div>
          </div>
        </div>

        {/* Contrato original */}
        <div className="relative">
          <div className="bg-gray-800 text-white rounded-lg p-4 overflow-auto h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">Contrato JSON</span>
              <div className="flex gap-2">
                <button
                  onClick={copyContract}
                  className="text-xs px-2 py-1 bg-gray-700 rounded"
                >
                  {copied ? 'Copiado ✓' : 'Copiar'}
                </button>
              </div>
            </div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {contractJson}
            </pre>
          </div>
        </div>
      </div>

      {/* Validación Spectral */}
      <div className="flex gap-2">
        <button
          onClick={runSpectral}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Validar con Spectral (simulado)
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
  );
}