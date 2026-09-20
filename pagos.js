/* ============================================================
   HELIOT MEDIA — Enlaces de pago (uso interno)
   ============================================================ */
(function () {
  'use strict';

  // Codificados en base64. Reemplaza por los tuyos reales.
  // Genera cada uno en la consola del navegador con:
  //   btoa('https://s.wompi.sv/TU_ENLACE_REAL')
  var _p = {
    'basico':        'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVIx',
    'amigos':        'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVIy',
    'premium':       'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVIz',
    'basico-promo':  'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVI0',
    'amigos-promo':  'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVI1',
    'premium-promo': 'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVI2',
    'estrella':      'aHR0cHM6Ly9zLndvbXBpLnN2L1JFRU1QTEFaQVI3'
  };

  var TTL = 15 * 60 * 1000; // 15 minutos

  function leerReserva() {
    try {
      var raw = sessionStorage.getItem('heliot_reserva');
      if (!raw) return null;
      var r = JSON.parse(raw);
      if (!r || !r.ts || (Date.now() - r.ts) > TTL) return null;
      return r;
    } catch (e) { return null; }
  }

  function guardarReserva(data) {
    data.ts = Date.now();
    data.token = 'hlt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
    sessionStorage.setItem('heliot_reserva', JSON.stringify(data));
    return data;
  }

  function reservaValida() {
    var r = leerReserva();
    if (!r) return false;
    return !!(r.paqueteId && r.nombre && r.email && r.telefono && r.fecha && r.hora);
  }

  window.HeliotPagos = {
    guardarReserva: guardarReserva,
    leerReserva: leerReserva,
    reservaValida: reservaValida,

    obtenerEnlace: function () {
      var r = leerReserva();
      if (!r || !r.paqueteId) return null;
      if (!(r.nombre && r.email && r.telefono && r.fecha && r.hora)) return null;
      var b64 = _p[r.paqueteId];
      if (!b64) return null;
      return atob(b64);
    },

    limpiarReserva: function () {
      sessionStorage.removeItem('heliot_reserva');
    }
  };
})();
