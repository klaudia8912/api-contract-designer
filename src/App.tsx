import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import StepApiInfo from './steps/StepApiInfo';
import StepResources from './steps/StepResources';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/api-info" replace />} />
        <Route path="api-info" element={<StepApiInfo />} />
        <Route path="resources" element={<StepResources />} />
        {/* Agrega más pasos aquí */}
      </Route>
    </Routes>
  );
}