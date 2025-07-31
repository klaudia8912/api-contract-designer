import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import StepApiInfo from './steps/StepApiInfo';
import StepResources from './steps/StepResources';
import StepOperations from './steps/StepOperations';
import StepReview from './steps/StepReview';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wizard" element={<Layout />}>
        <Route path="api-info" element={<StepApiInfo />} />
        <Route path="resources" element={<StepResources />} />
        <Route path="operations" element={<StepOperations />} />
        <Route path="review" element={<StepReview />} />
      </Route>
    </Routes>
  );
}