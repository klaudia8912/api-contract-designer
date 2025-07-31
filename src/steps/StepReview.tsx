// src/steps/StepReview.tsx
import { useMemo, useState, useCallback } from 'react';
import yaml from 'js-yaml';
import { Spectral } from '@stoplight/spectral-core';
import { useContract } from '../context/ContractContext';
import { buildOpenApi } from '../utils/openapi';

export default function StepReview() {
  const { apiInfo, resources, operations } = useContract();

  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [spectralWarnings, setSpectralWarnings] = useState<string[] | null>(null);
  const [running, setRunning] = useState(false);

  const contract = useMemo(
    () => ({
      apiInfo,
      resources,
      operations,
    }),
    [apiInfo, resources, operations]
  );
  const contractJson = useMemo(() => JSON.stringify(contract, null, 2), [contract]);

  const openApiSpec = useMemo(() => buildOpenApi(contract as any), [contract]);
  const openApiJson = useMemo(() => JSON.stringify(openApiSpec, null, 2), [openApiSpec]);
  const openApiYaml = useMemo(() => yaml.dump(openApiSpec), [openApiSpec]);

  const handleCopyContract = useCallback(async () => {
    await navigator.clipboard.writeText(contractJson);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 1500);
  }, [contractJson]);

  const handleCopySpec = useCallback(async () => {
    await navigator.clipboard.writeText(openApiYaml);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 1500);
  }, [openApiYaml]);

  const exportContract = () => {
    const blob = new Blob([contractJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apiInfo.name || 'api-contract'}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!apiInfo.name.trim()) errors.push('El nombre de la API es obligatorio.');
  if (!apiInfo.baseUrl.trim()) errors.push('La Base URL es obligatoria.');
  if (apiInfo.baseUrl && !/^https?:\/\/.+/i.test(apiInfo.baseUrl))
    warnings.push('Base URL no parece válida (debe empezar con http:// o https://).');
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

  const runSpectralReal = useCallback(async () => {
    setRunning(true);
    const spectral = new Spectral();
  
    let loadedRuleset = false;
    try {
      const res = await fetch('/.spectral.yaml');
      if (res.ok) {
        const text = await res.text();
        // parsea el YAML a objeto
        const parsed = yaml.load(text);
        if (typeof parsed === 'object' && parsed !== null) {
          await spectral.setRuleset(parsed as any);
          loadedRuleset = true;
        }
      }
    } catch {
      // fallback si no se pudo cargar o parsear
    }
  
    if (!loadedRuleset) {
      await spectral.setRuleset({
        rules: {
          'servers-present': {
            given: '$.servers',
            then: {
              function: 'truthy',
              message: 'Debe definirse al menos un server.',
            },
          },
          'openapi-field': {
            given: '$.openapi',
            then: {
              function: 'pattern',
              functionOptions: { match: '^3\\.0\\.[0-9]+$' },
              message: 'El campo openapi debe ser 3.0.x o superior.',
            },
          },
        },
        // opcional: no necesitas especificar formats si no lo tienes instalado / quieres simplificar
        formats: [/* puedes omitir isOpenApiv3 si no lo importas */],
      } as any);
    }
  
    let results: any[] = [];
    try {
      results = await spectral.run(openApiSpec as any);
    } catch (e) {
      setSpectralWarnings([`Error ejecutando Spectral: ${(e as Error).message}`]);
      setRunning(false);
      return;
    }
  
    if (!results.length) {
      setSpectralWarnings(['No se encontraron problemas con Spectral.']);
      setRunning(false);
      return;
    }
  
    const formatted = results.map((r) => {
      const sev = r.severity === 0 ? 'Error' : 'Warning';
      const loc =
        r.range && r.range.start
          ? `[L${r.range.start.line + 1}:C${r.range.start.character + 1}]`
          : '';
      return `${sev} ${loc} ${r.code || ''} ${r.message}`;
    });
  
    setSpectralWarnings(formatted);
    setRunning(false);
  }, [openApiSpec]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Paso Review: Revisión y Exportación</h2>

      <div className="grid gap-6 md:grid-cols-2">
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

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={runSpectralReal}
              disabled={running}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {running ? 'Validando...' : 'Validar con Spectral'}
            </button>
            <button
              onClick={exportContract}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Descargar contrato JSON
            </button>
            <button onClick={handleCopyContract} className="border border-gray-300 px-4 py-2 rounded">
              {copiedContract ? 'Contrato copiado ✓' : 'Copiar contrato'}
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

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Spec OpenAPI</h3>
              <div className="flex gap-2">
                <button onClick={handleCopySpec} className="text-sm px-3 py-1 border rounded hover:bg-gray-100">
                  {copiedSpec ? 'YAML copiado ✓' : 'Copiar YAML'}
                </button>
                <button onClick={exportSpec} className="text-sm px-3 py-1 border rounded hover:bg-gray-100">
                  Descargar YAML
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 font-medium">YAML</div>
                <pre className="bg-gray-900 text-white rounded p-2 overflow-auto text-xs max-h-[320px]">
                  {openApiYaml}
                </pre>
              </div>
              <div>
                <div className="mb-1 font-medium">JSON</div>
                <pre className="bg-gray-800 text-white rounded p-2 overflow-auto text-xs max-h-[320px]">
                  {openApiJson}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 text-white rounded-lg p-4 overflow-auto">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">Contrato JSON</span>
              <button onClick={handleCopyContract} className="text-xs px-2 py-1 bg-gray-700 rounded">
                {copiedContract ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">{contractJson}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}