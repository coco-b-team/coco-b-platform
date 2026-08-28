// Compartido entre el menú hamburguesa (mobile/tablet) y la barra de
// navegación de desktop, para no mantener la misma lista en dos lugares.
// `key` referencia a messages/*.json → nav.<key>, no un texto fijo.
export const NAV_LINKS = [
  { href: '/villas', key: 'villas' },
  { href: '/#mix-match', key: 'mixMatch' },
  { href: '/about', key: 'about' },
  // Entra a /admin (redirige solo a /admin/login si no hay sesión) — a
  // propósito discreto/sin traducir en los 3 idiomas, es para el equipo,
  // no contenido pensado para huéspedes.
  { href: '/admin', key: 'staff' },
] as const;
