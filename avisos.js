/* ============================================================
   HELIOT MEDIA — Configuración de avisos legales
   ------------------------------------------------------------
   Este archivo se carga dinámicamente desde app.js.
   NO incluir <script> en las páginas HTML.

   Para agregar un aviso nuevo:
   1. Abre avisos-admin.html
   2. Llena el formulario
   3. Copia el bloque generado y pégalo dentro del array
   ============================================================ */
window.HELIOT_AVISOS = [

  /* -------- EJEMPLO 1: Aviso previo de cambio -------- */
  {
    id: '2026-09-legal-v3.5',
    activo: true,
    tipo: 'previo', // 'previo' | 'vigente' | 'informativo'
    titulo: 'Actualizaremos nuestros Términos y Condiciones',
    eyebrow: 'Aviso previo',
    fechaCambio: '30 de septiembre de 2026',
    diasAnticipo: '5 días hábiles',
    parrafos: [
      'Te informamos que Heliot Media actualizará sus Términos y Condiciones y su Política de Privacidad el próximo 30 de septiembre de 2026.',
      'Conforme a la cláusula 2 de nuestros Términos vigentes, este aviso se emite con al menos 5 días hábiles de anticipación. Las modificaciones no afectarán los contratos ya celebrados antes de su entrada en vigor.',
      'Te recomendamos revisar los documentos actualizados a partir de la fecha indicada. El uso continuado del sitio tras la entrada en vigor constituirá la aceptación plena de las modificaciones.'
    ],
    enlaceTexto: 'Ver Términos vigentes',
    enlaceUrl: 'terminos-y-condiciones-de-uso.html',
    botonTexto: 'Entendido',
    nota: 'Este aviso no modifica los Términos vigentes. Solo notifica su próxima actualización.'
  }

];
