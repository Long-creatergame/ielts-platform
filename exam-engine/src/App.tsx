import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './routes/Home';
import TestShell from './routes/TestShell';
import Review from './routes/Review';
import Results from './routes/Results';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test/:testId/:module" element={<TestShell />} />
      <Route path="/review/:testId/:module" element={<Review />} />
      <Route path="/results/:testId" element={<Results />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

