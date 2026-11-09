/**
 * Ejecuta la acción la primera vez que el elemento entra en pantalla.
 * Sin IntersectionObserver (navegadores viejos, tests) la ejecuta enseguida.
 * Devuelve una función para dejar de observar.
 */
export function cuandoSeVea(elemento: Element, accion: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    accion();
    return () => {};
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        observador.disconnect();
        accion();
      }
    },
    { threshold: 0.15 },
  );
  observador.observe(elemento);
  return () => observador.disconnect();
}

/** true si la persona pidió menos movimiento en su sistema. */
export function prefiereMenosMovimiento(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
