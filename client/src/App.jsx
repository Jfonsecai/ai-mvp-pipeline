import { Link, Navigate, Route, Routes } from 'react-router-dom';
import TechnicalStatus from './pages/TechnicalStatus.jsx';
import ProviderSignUp from './pages/ProviderSignUp.jsx';
import ProviderWelcome from './pages/ProviderWelcome.jsx';
import OwnerSignUp from './pages/OwnerSignUp.jsx';
import OwnerWelcome from './pages/OwnerWelcome.jsx';

// COMP-001 routing foundation. Screens SCR-UX-001 to SCR-UX-017 are added by their user stories,
// each as a <Route> here, with access guards by account type (UX_SPEC 6.1, ARCHITECTURE 6.2).
// The fallback below is temporary: US-003 replaces it with the session-based redirect to
// SCR-UX-001 (no session) or the home of the account type.
export default function App() {
  return (
    <Routes>
      <Route path="/estado-tecnico" element={<TechnicalStatus />} />
      <Route path="/" element={<main className="page-shell"><section className="form-card"><h1>VetCare</h1><p>Elige el tipo de cuenta que quieres crear.</p><Link className="button-link" to="/owner/sign-up">Crear cuenta de dueño de mascota</Link><Link className="button-link" to="/provider/sign-up">Crear cuenta de proveedor</Link></section></main>} />
      <Route path="/owner/sign-up" element={<OwnerSignUp />} />
      <Route path="/owner/home" element={<OwnerWelcome />} />
      <Route path="/provider/sign-up" element={<ProviderSignUp />} />
      <Route path="/provider/profile" element={<ProviderWelcome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
