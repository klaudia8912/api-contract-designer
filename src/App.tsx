import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import StepApiInfo from './steps/StepApiInfo';
import StepResources from './steps/StepResources';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wizard" element={<Layout />}>
        <Route path="api-info" element={<StepApiInfo />} />
        <Route path="resources" element={<StepResources />} />
        {/* Agrega más pasos aquí */}
      </Route>
    </Routes>
  );
}