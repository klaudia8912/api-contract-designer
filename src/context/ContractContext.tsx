import React, {
    createContext,
    useContext,
    useState,

    useCallback,
    useMemo,
  } from 'react';
import type { ReactNode } from 'react';
import type { ApiInfo, Resource } from '../types/contract';

  
  interface ContractContextValue {
    apiInfo: ApiInfo;
    setApiInfo: (info: Partial<ApiInfo>) => void;
    resources: Resource[];
    addResource: (r: Resource) => void;
  }
  
  const INITIAL_API_INFO: ApiInfo = {
    name: '',
    type: '',
    version: '1.0.0',
    baseUrl: '',
    // description? if defines en el tipo
  };
  
  const defaultValue: ContractContextValue = {
    apiInfo: INITIAL_API_INFO,
    setApiInfo: () => {},
    resources: [],
    addResource: () => {},
  };
  
  const ContractContext = createContext<ContractContextValue>(defaultValue);
  
  export const useContract = () => useContext(ContractContext);
  
  export const ContractProvider = ({ children }: { children: ReactNode }) => {
    const [apiInfo, setApiInfoState] = useState<ApiInfo>(INITIAL_API_INFO);
    const [resources, setResources] = useState<Resource[]>([]);
  
    const setApiInfo = useCallback((info: Partial<ApiInfo>) => {
      setApiInfoState((prev) => ({ ...prev, ...info }));
    }, []);
  
    const addResource = useCallback((r: Resource) => {
      setResources((prev) => [...prev, r]);
    }, []);
  
    const value = useMemo(
      () => ({ apiInfo, setApiInfo, resources, addResource }),
      [apiInfo, setApiInfo, resources, addResource]
    );
  
    return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
  };