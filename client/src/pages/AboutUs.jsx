import { Link } from 'react-router-dom';

export default function AboutUs({ accountType }) {
  return <main className="page-shell about-page">
    <article className="about-card">
      <div className="about-hero">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=85" alt="Un perro y un gato acompañándose" />
        <div className="about-hero-copy"><span className="about-eyebrow">Cuidamos de quienes te cuidan</span><h1>Acerca de VetCare</h1><p>Un lugar para encontrar atención veterinaria cercana y sencilla para tus mascotas.</p></div>
      </div>
      <div className="about-content">
        <section><h2>¿Qué hacemos?</h2><p>VetCare conecta a las familias con clínicas y profesionales veterinarios. Desde la app puedes descubrir servicios, consultar información de cada proveedor y agendar citas en clínica o a domicilio.</p></section>
        <section className="about-values">
          <div><span aria-hidden="true">♡</span><h3>Bienestar animal</h3><p>Facilitamos el acceso al cuidado que cada mascota necesita.</p></div>
          <div><span aria-hidden="true">⌕</span><h3>Información clara</h3><p>Compara servicios, modalidades y precios en un solo lugar.</p></div>
          <div><span aria-hidden="true">✦</span><h3>Conexiones cercanas</h3><p>Encuentra profesionales veterinarios y clínicas en Bogotá.</p></div>
        </section>
        <Link className="button-link about-back-link" to={accountType === 'owner' ? '/owner/home' : '/provider/appointments'}>Volver a VetCare</Link>
      </div>
    </article>
  </main>;
}
