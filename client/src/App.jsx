import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from './api/client.js';
import TechnicalStatus from './pages/TechnicalStatus.jsx';
import ProviderSignUp from './pages/ProviderSignUp.jsx';
import ProviderWelcome from './pages/ProviderWelcome.jsx';
import OwnerSignUp from './pages/OwnerSignUp.jsx';
import OwnerWelcome from './pages/OwnerWelcome.jsx';
import SignIn from './pages/SignIn.jsx';
import ProviderWorkingHours from './pages/ProviderWorkingHours.jsx';

const homePath = (type) => type === 'owner' ? '/owner/home' : '/provider/profile';

function SessionHome({ session }) {
  return session.state === 'active' ? <Navigate to={homePath(session.accountType)} replace /> : <Navigate to="/sign-in" replace />;
}

function GuestOnly({ session, children }) {
  if (session.state === 'active') return <Navigate to={homePath(session.accountType)} replace />;
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

  return <>
    <header className="app-header">
      <Link className="wordmark" to="/">VetCare</Link>
      {accountType === 'provider' && <nav className="provider-navigation" aria-label="Menú principal">
        <NavLink to="/provider/working-hours">Horario</NavLink>
      </nav>}
      <div className="account-menu" data-account-menu>
        <button ref={buttonRef} className="button-secondary" type="button" aria-expanded={menuOpen} aria-controls="account-menu-panel" onClick={() => setMenuOpen((open) => !open)}>Cuenta</button>
        {menuOpen && <div id="account-menu-panel" ref={menuRef} className="account-menu-panel" tabIndex={-1}>
          <p>{accountType === 'owner' ? 'Dueño de mascota' : 'Proveedor'}</p>
          <button className="account-menu-action" type="button" onClick={signOut}>Cerrar sesión</button>
        </div>}
      </div>
    </header>
    {children}
  </>;
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
    <Route path="/" element={<SessionHome session={session} />} />
    <Route path="/sign-in" element={session.state === 'active'
      ? <Navigate to={homePath(session.accountType)} replace />
      : <SignIn expired={expired} unavailable={session.state === 'unavailable'} onAuthenticated={setSession} />} />
    <Route path="/owner/sign-up" element={<GuestOnly session={session}><OwnerSignUp onAuthenticated={setSession} /></GuestOnly>} />
    <Route path="/provider/sign-up" element={<GuestOnly session={session}><ProviderSignUp onAuthenticated={setSession} /></GuestOnly>} />
    <Route path="/owner/home" element={<RolePage session={session} role="owner" onSignedOut={onSignedOut}><OwnerWelcome /></RolePage>} />
    <Route path="/provider/profile" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><ProviderWelcome /></RolePage>} />
    <Route path="/provider/working-hours" element={<RolePage session={session} role="provider" onSignedOut={onSignedOut}><ProviderWorkingHours /></RolePage>} />
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
