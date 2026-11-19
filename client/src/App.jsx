import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from './api/client.js';
import TechnicalStatus from './pages/TechnicalStatus.jsx';
import ProviderSignUp from './pages/ProviderSignUp.jsx';
import ProviderProfile from './pages/ProviderProfile.jsx';
import OwnerSignUp from './pages/OwnerSignUp.jsx';
import OwnerSearch from './pages/OwnerSearch.jsx';
import OwnerAssistant from './pages/OwnerAssistant.jsx';
import OwnerPets from './pages/OwnerPets.jsx';
import OwnerAppointments from './pages/OwnerAppointments.jsx';
import RescheduleAppointment from './pages/RescheduleAppointment.jsx';
import ProviderPublicProfile from './pages/ProviderPublicProfile.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import SignIn from './pages/SignIn.jsx';
import ProviderWorkingHours from './pages/ProviderWorkingHours.jsx';
import ProviderCatalog from './pages/ProviderCatalog.jsx';
import ProviderAppointments from './pages/ProviderAppointments.jsx';
import AboutUs from './pages/AboutUs.jsx';
import PublishService from './pages/PublishService.jsx';
import PublishProduct from './pages/PublishProduct.jsx';

const homePath = (type) => type === 'owner' ? '/owner/home' : '/provider/appointments';

function PawMark({ className = '' }) {
  return <span className={`brand-paw ${className}`} aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="10" cy="12" r="4"/><circle cx="18" cy="7" r="4"/><circle cx="27" cy="8" r="4"/><circle cx="34" cy="14" r="4"/><path d="M8 26c0-6 5-10 12-10s12 4 12 10c0 5-4 8-9 6l-3-1-3 1c-5 2-9-1-9-6Z"/><path className="paw-heart" d="M20 27s-4-2.3-4-4.7a2.3 2.3 0 0 1 4-1.5 2.3 2.3 0 0 1 4 1.5c0 2.4-4 4.7-4 4.7Z"/></svg></span>;
}

function SessionHome({ session }) {
  return session.state === 'active' ? <Navigate to={homePath(session.accountType)} replace /> : <Navigate to="/sign-in" replace />;
}

function GuestOnly({ session, children }) {
  const wasAuthenticatedOnEntry = useRef(session.state === 'active');
  if (session.state === 'active' && wasAuthenticatedOnEntry.current) return <Navigate to={homePath(session.accountType)} replace />;
  if (session.state === 'expired') return <Navigate to="/sign-in" replace />;
  return children;
}

function RolePage({ session, role, children, onSignedOut }) {
  if (session.state !== 'active') return <Navigate to="/sign-in" replace />;
  if (session.accountType !== role) return <Navigate to="/not-found" replace />;
  return <SignedInScreen accountType={role} onSignedOut={onSignedOut}>{children}</SignedInScreen>;
}

function SignedInScreen({ accountType, children, onSignedOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (menuOpen) menuRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = (event) => {
      if (!event.target.closest?.('[data-account-menu]')) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const signOut = () => {
    setMenuOpen(false);
    sessionStorage.setItem('vetcare:signed-out', 'true');
    onSignedOut({ state: 'none', features: [] });
    navigate('/sign-in', { replace: true });
    apiFetch('/api/auth/sign-out', { method: 'POST' }).catch(() => {});
  };

  const iconFor = (label) => {
    const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
    if (label === 'Buscar') return <svg {...common}><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>;
    if (label === 'Asistente') return <svg {...common}><path d="M12 3a8 8 0 0 0-4.6 14.5L7 21l4-2a9 9 0 0 0 1 .1 8 8 0 1 0 0-16Z"/><path d="M9 12h.01M12 12h.01M15 12h.01"/></svg>;
    if (label === 'Mis citas' || label === 'Citas') return <svg {...common}><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 9h16M8 13h3M8 17h3"/></svg>;
    if (label === 'Mis mascotas') return <svg {...common}><path d="M12 20c-4.5 0-8-2.4-8-5.5S7.6 9 12 9s8 2.4 8 5.5S16.5 20 12 20Z"/><circle cx="5" cy="7" r="1.6"/><circle cx="9" cy="4.5" r="1.6"/><circle cx="15" cy="4.5" r="1.6"/><circle cx="19" cy="7" r="1.6"/></svg>;
    if (label === 'Catálogo') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 6h16M8 10h7M8 14h8"/></svg>;
    if (label === 'Horario') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>;
    return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0M19 4l1 1 2-2"/></svg>;
  };

  return <div className="app-layout">
    <header className="app-header">
      <Link className="wordmark" to="/" aria-label="VetCare, inicio"><PawMark /><span>Vet<span className="wordmark-accent">Care</span></span></Link>
      {accountType === 'provider' && <nav className="provider-navigation" aria-label="Menú principal">
        <NavLink to="/provider/appointments">{iconFor('Citas')}<span>Citas</span></NavLink>
        <NavLink to="/provider/catalog">{iconFor('Catálogo')}<span>Catálogo</span></NavLink>
        <NavLink to="/provider/working-hours">{iconFor('Horario')}<span>Horario</span></NavLink>
        <NavLink to="/provider/profile">{iconFor('Perfil')}<span>Perfil</span></NavLink>
      </nav>}
      {accountType === 'owner' && <nav className="owner-navigation" aria-label="Menú principal">
        <NavLink to="/owner/home">{iconFor('Buscar')}<span>Buscar</span></NavLink>
        <NavLink to="/owner/assistant">{iconFor('Asistente')}<span>Asistente</span></NavLink>
        <NavLink to="/owner/appointments">{iconFor('Mis citas')}<span>Mis citas</span></NavLink>
        <NavLink to="/owner/pets">{iconFor('Mis mascotas')}<span>Mis mascotas</span></NavLink>
      </nav>}
      <div className="account-menu" data-account-menu>
        <button ref={buttonRef} className="button-secondary" type="button" aria-label="Cuenta" aria-expanded={menuOpen} aria-controls="account-menu-panel" onClick={() => setMenuOpen((open) => !open)}><span className="account-menu-label">Cuenta</span><PawMark className="account-brand-mark" /></button>
        {menuOpen && <div id="account-menu-panel" ref={menuRef} className="account-menu-panel" tabIndex={-1}>
          <p>{accountType === 'owner' ? 'Dueño de mascota' : 'Proveedor'}</p>
          <Link className="account-menu-action account-menu-link" to="/about" onClick={() => setMenuOpen(false)}>Acerca de nosotros</Link>
          <button className="account-menu-action" type="button" onClick={signOut}>Cerrar sesión</button>
        </div>}
      </div>
    </header>
    <div className="app-main">
      {children}
      <footer className="app-footer"><span>© VetCare · Bogotá, Colombia</span><span>Horarios en hora de Bogotá · Precios en COP</span></footer>
    </div>
  </div>;
}

function NotFound({ session }) {
  const target = session.state === 'active' ? homePath(session.accountType) : '/sign-in';
  return <main className="page-shell"><section className="form-card"><h1>No puedes ver esta página</h1><p>La dirección no está disponible para esta cuenta.</p><Link className="button-link" to={target}>Ir al inicio</Link></section></main>;
}

function RoutedApp({ session, setSession, onSignedOut }) {
  const location = useLocation();
  const navigate = useNavigate();
  const lastPath = useRef(location.pathname);
  const expired = session.state === 'expired' || (location.state?.sessionExpired === true);

  useEffect(() => {
    const onSessionEnded = (event) => {
      setSession({ state: event.detail.code === 'SESSION_EXPIRED' ? 'expired' : 'none', features: [] });
      navigate('/sign-in', { replace: true, state: { sessionExpired: event.detail.code === 'SESSION_EXPIRED' } });
    };
    window.addEventListener('vetcare:session-ended', onSessionEnded);
    return () => window.removeEventListener('vetcare:session-ended', onSessionEnded);
  }, [navigate, setSession]);

  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    if (session.state !== 'active') return;
    let mounted = true;
    apiFetch('/api/session').then((current) => {
      if (mounted) setSession(current);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname, session.state, setSession]);

  return <Routes>
    <Route path="/estado-tecnico" element={<TechnicalStatus />} />
    <Route path="/about" element={session.state === 'active'
      ? <SignedInScreen accountType={session.accountType} onSignedOut={onSignedOut}><AboutUs accountType={session.accountType} /></SignedInScreen>
      : <Navigate to="/sign-in" replace />} />
    <Route path="/" element={<SessionHome session={session} />} />
    <Route path="/sign-in" element={session.state === 'active'
      ? <Navigate to={homePath(session.accountType)} replace />
      : <SignIn expired={expired} unavailable={session.state === 'unavailable'} onAuthenticated={setSession} />} />
    <Route path="/owner/sign-up" element={<GuestOnly session={session}><OwnerSignUp onAuthenticated={setSession} /></GuestOnly>} />
    <Route path="/provider/sign-up" element={<GuestOnly session={session}><ProviderSignUp onAuthenticated={setSession} /></GuestOnly>} />
    <Route path="/owner/home" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><OwnerSearch /></RolePage>} />
    <Route path="/owner/assistant" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><OwnerAssistant /></RolePage>} />
    <Route path="/owner/appointments" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><OwnerAppointments /></RolePage>} />
    <Route path="/owner/appointments/:appointmentId/reschedule" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><RescheduleAppointment /></RolePage>} />
    <Route path="/owner/pets" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><OwnerPets /></RolePage>} />
    <Route path="/owner/providers/:providerId" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><ProviderPublicProfile /></RolePage>} />
    <Route path="/owner/services/:serviceId/book" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><BookAppointment /></RolePage>} />
    <Route path="/provider/profile" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><ProviderProfile /></RolePage>} />
    <Route path="/provider/appointments" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><ProviderAppointments /></RolePage>} />
    <Route path="/provider/appointments/:appointmentId/reschedule" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><RescheduleAppointment role="provider" /></RolePage>} />
    <Route path="/provider/working-hours" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><ProviderWorkingHours /></RolePage>} />
    <Route path="/provider/catalog" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><ProviderCatalog /></RolePage>} />
    <Route path="/provider/services/new" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><PublishService /></RolePage>} />
    <Route path="/provider/services/:offeringId/edit" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><PublishService /></RolePage>} />
    <Route path="/provider/products/new" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><PublishProduct /></RolePage>} />
    <Route path="/provider/products/:offeringId/edit" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><PublishProduct /></RolePage>} />
    <Route path="/not-found" element={<NotFound session={session} />} />
    <Route path="*" element={session.state === 'active' ? <NotFound session={session} /> : <Navigate to="/sign-in" replace />} />
  </Routes>;
}

export default function App() {
  const [session, setSession] = useState({ state: 'loading', features: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (sessionStorage.getItem('vetcare:signed-out') === 'true') {
      setSession({ state: 'none', features: [] });
      setReady(true);
      return () => { mounted = false; };
    }
    apiFetch('/api/session')
      .then((value) => { if (mounted) setSession(value); })
      .catch((error) => {
        if (!mounted) return;
        if (error instanceof ApiError && error.code === 'UNEXPECTED') setSession({ state: 'unavailable', features: [] });
        else setSession({ state: 'none', features: [] });
      })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  if (!ready) return <main className="page-shell"><p role="status">Cargando…</p></main>;
  const acceptSession = (value) => {
    sessionStorage.removeItem('vetcare:signed-out');
    setSession(value);
  };
  return <RoutedApp session={session} setSession={acceptSession} onSignedOut={setSession} />;
}
