import { Navigate, Route, Routes } from 'react-router-dom';
import TechnicalStatus from './pages/TechnicalStatus.jsx';

// COMP-001 routing foundation. Screens SCR-UX-001 to SCR-UX-017 are added by their user stories,
// each as a <Route> here, with access guards by account type (UX_SPEC 6.1, ARCHITECTURE 6.2).
// The fallback below is temporary: US-003 replaces it with the session-based redirect to
// SCR-UX-001 (no session) or the home of the account type.
export default function App() {
  return (
    <Routes>
      <Route path="/estado-tecnico" element={<TechnicalStatus />} />
      <Route path="*" element={<Navigate to="/estado-tecnico" replace />} />
    </Routes>
  );
}
