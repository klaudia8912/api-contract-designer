import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

import type { ReactNode } from 'react';
import type { ApiInfo, Resource , Operation} from '../types/contract';

interface ContractContextValue {
  apiInfo: ApiInfo;
  setApiInfo: (info: Partial<ApiInfo>) => void;
  resources: Resource[];
  addResource: (r: Resource) => void;
  operations: Record<string, Operation[]>;
  addOperation: (resourceName: string, op: Operation) => void;
  updateOperation: (resourceName: string, index: number, op: Operation) => void;
  removeOperation: (resourceName: string, index: number) => void;
}

const INITIAL_API_INFO: ApiInfo = {
  name: '',
  type: '',
  version: '1.0.0',
  baseUrl: '',
};

const defaultValue: ContractContextValue = {
  apiInfo: INITIAL_API_INFO,
  setApiInfo: () => {},
  resources: [],
  addResource: () => {},
  operations: {},
  addOperation: () => {},
  updateOperation: () => {},
  removeOperation: () => {},
};

const ContractContext = createContext<ContractContextValue>(defaultValue);

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [apiInfo, setApiInfoState] = useState<ApiInfo>(INITIAL_API_INFO);
  const [resources, setResources] = useState<Resource[]>([]);
  const [operations, setOperations] = useState<Record<string, Operation[]>>({});

  const setApiInfo = useCallback((info: Partial<ApiInfo>) => {
    setApiInfoState((prev) => ({ ...prev, ...info }));
  }, []);

  const addResource = useCallback((r: Resource) => {
    setResources((prev) => {
      // evitar duplicados por nombre
      if (prev.find((x) => x.name === r.name)) return prev;
      return [...prev, r];
    });
  }, []);

  const addOperation = useCallback((resourceName: string, op: Operation) => {
    setOperations((prev) => {
      const existing = prev[resourceName] || [];
      return { ...prev, [resourceName]: [...existing, op] };
    });
  }, []);

  const updateOperation = useCallback((resourceName: string, index: number, op: Operation) => {
    setOperations((prev) => {
      const existing = prev[resourceName] || [];
      if (index < 0 || index >= existing.length) return prev;
      const updated = [...existing];
      updated[index] = op;
      return { ...prev, [resourceName]: updated };
    });
  }, []);

  const removeOperation = useCallback((resourceName: string, index: number) => {
    setOperations((prev) => {
      const existing = prev[resourceName] || [];
      if (index < 0 || index >= existing.length) return prev;
      const updated = existing.filter((_, i) => i !== index);
      return { ...prev, [resourceName]: updated };
    });
  }, []);

  const value = useMemo(
    () => ({
      apiInfo,
      setApiInfo,
      resources,
      addResource,
      operations,
      addOperation,
      updateOperation,
      removeOperation,
    }),
    [apiInfo, setApiInfo, resources, addResource, operations, addOperation, updateOperation, removeOperation]
  );

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}; 