'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/context/ConfigContext';

interface Odontologo {
  id: number;
  nombre: string;
  especialidad: string;
}

interface Turno {
  id: number;
  paciente_nombre: string;
  paciente_dni?: string;
  telefono?: string;
  fecha: string;
  fecha_arg?: string;
  hora: string;
  especialidad?: string;
  profesional?: string;
  motivo?: string;
  estado: string;
}

interface SesionActiva {
  email: string;
  rol: 'admin' | 'odontologo' | 'recepcion';
  nombre: string;
  autenticado: boolean;
}

export default function AgendaInternaPage() {
  const router = useRouter();
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<SesionActiva | null>(null);

  // Navegación de Fechas y Vistas
  const [fechaActual, setFechaActual] = useState(new Date(2026, 10, 6));
  const [modoVista, setModoVista] = useState<'dia' | 'semana' | 'mes'>('semana');

  // Modal de Detalle del Turno
  const [turnoDetalle, setTurnoDetalle] = useState<Turno | null>(null);

  // Filtros
  const [odontologoSel, setOdontologoSel] = useState('Todos los Odontólogos');
  const [especialidadSel, setEspecialidadSel] = useState('Todas las Especialidades');

  // Modal Crear / Reprogramar Turno
  const [mostrarModalManual, setMostrarModalManual] = useState(false);
  const [turnoIdAReprogramar, setTurnoIdAReprogramar] = useState<number | null>(null);

  // Formulario Manual
  const [manualNombre, setManualNombre] = useState('');
  const [manualDni, setManualDni] = useState('');
  const [manualTelefono, setManualTelefono] = useState('');
  const [manualProf, setManualProf] = useState('Od. Sofía Martínez');
  const [manualEsp, setManualEsp] = useState('Cirugía Maxilofacial');
  const [manualDia, setManualDia] = useState('06');
  const [manualMes, setManualMes] = useState('11');
  const [manualAnio, setManualAnio] = useState('2026');
  const [manualHora, setManualHora] = useState('11:30');
  const [manualMotivo, setManualMotivo] = useState('');
  const [guardandoTurno, setGuardandoTurno] = useState(false);

  const odontologosLista: Odontologo[] = [
    { id: 1, nombre: 'Od. Sofía Martínez', especialidad: 'Cirugía Maxilofacial' },
    { id: 2, nombre: 'Od. González', especialidad: 'Odontología General' },
    { id: 3, nombre: 'Od. Graciela Quiroga', especialidad: 'Odontología General' },
    { id: 4, nombre: 'Od. Hugo Medran', especialidad: 'Guardia' },
    { id: 5, nombre: 'Od. Fermín Ballester', especialidad: 'Guardia' },
    { id: 6, nombre: 'Od. Rodolfo Medran', especialidad: 'Guardia' },
    { id: 7, nombre: 'Od. María González', especialidad: 'Ortodoncia' },
    { id: 8, nombre: 'Od. Diagnóstico Radiológico', especialidad: 'Pantomografía y Diagnóstico' }
  ];

  const HORARIOS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  const MESES = [
    { num: '01', nombre: 'Enero' }, { num: '02', nombre: 'Febrero' }, { num: '03', nombre: 'Marzo' },
    { num: '04', nombre: 'Abril' }, { num: '05', nombre: 'Mayo' }, { num: '06', nombre: 'Junio' },
    { num: '07', nombre: 'Julio' }, { num: '08', nombre: 'Agosto' }, { num: '09', nombre: 'Septiembre' },
    { num: '10', nombre: 'Octubre' }, { num: '11', nombre: 'Noviembre' }, { num: '12', nombre: 'Diciembre' }
  ];

  const cargarTurnos = () => {
    const turnosLocalesRaw = localStorage.getItem('medent_turnos_locales');
    const turnosLocales: Turno[] = turnosLocalesRaw ? JSON.parse(turnosLocalesRaw) : [];

    fetch('https://medent-backend.onrender.com/api/turnos', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const idsExistentes = new Set(data.map((t: Turno) => t.id));
          const unificados = [...data, ...turnosLocales.filter(t => !idsExistentes.has(t.id))];
          setTurnos(unificados);
        } else {
          setTurnos(turnosLocales);
        }
      })
      .catch(() => {
        setTurnos(turnosLocales);
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('medent_sesion');
    if (sesionGuardada) {
      setSesion(JSON.parse(sesionGuardada));
    } else {
      // Respaldo por defecto si se entra directo sin pasar por login
      setSesion({ email: 'admin@medent.com', rol: 'admin', nombre: 'Dirección Médica', autenticado: true });
    }

    setMounted(true);
    cargarTurnos();

    const interval = setInterval(() => {
      cargarTurnos();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('medent_sesion');
    router.push('/login');
  };

  const formatoFechaISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatoFechaArg = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${m}/${y}`;
  };

  const obtenerDiasSemana = () => {
    const curr = new Date(fechaActual);
    const dayOfWeek = curr.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    const nombres = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
    const dias = [];

    for (let i = 0; i < 5; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);

      const año = nextDay.getFullYear();
      const mes = String(nextDay.getMonth() + 1).padStart(2, '0');
      const dia = String(nextDay.getDate()).padStart(2, '0');

      dias.push({
        nombre: nombres[i],
        fecha_iso: `${año}-${mes}-${dia}`,
        fecha_arg: `${dia}/${mes}/${año}`,
        label: `${dia}/${mes}/${año}`
      });
    }
    return dias;
  };

  const obtenerDiasMes = () => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const totalDias = new Date(year, month + 1, 0).getDate();
    const dias = [];

    for (let i = 1; i <= totalDias; i++) {
      const d = new Date(year, month, i);
      const iso = formatoFechaISO(d);
      const diaStr = String(i).padStart(2, '0');
      const mesStr = String(month + 1).padStart(2, '0');
      dias.push({ diaNum: i, fechaISO: iso, fechaArg: `${diaStr}/${mesStr}/${year}`, diaSemana: d.getDay() });
    }
    return dias;
  };

  const DIAS_SEMANA = obtenerDiasSemana();
  const DIAS_MES = obtenerDiasMes();

  const desplazarFecha = (delta: number) => {
    const nueva = new Date(fechaActual);
    if (modoVista === 'dia') {
      nueva.setDate(nueva.getDate() + delta);
    } else if (modoVista === 'semana') {
      nueva.setDate(nueva.getDate() + (delta * 7));
    } else if (modoVista === 'mes') {
      nueva.setMonth(nueva.getMonth() + delta);
    }
    setFechaActual(nueva);
  };

  const irAHoy = () => {
    setFechaActual(new Date(2026, 10, 6));
  };

  const abrirModalParaHorario = (hora: string, fechaTarget?: string) => {
    let d = '06', m = '11', a = '2026';
    if (fechaTarget) {
      if (fechaTarget.includes('/')) {
        const p = fechaTarget.split('/');
        d = p[0]; m = p[1]; a = p[2];
      } else if (fechaTarget.includes('-')) {
        const p = fechaTarget.split('-');
        a = p[0]; m = p[1]; d = p[2];
      }
    } else {
      d = String(fechaActual.getDate()).padStart(2, '0');
      m = String(fechaActual.getMonth() + 1).padStart(2, '0');
      a = String(fechaActual.getFullYear());
    }

    setTurnoIdAReprogramar(null);
    setManualDia(d);
    setManualMes(m);
    setManualAnio(a);
    setManualHora(hora);
    setMostrarModalManual(true);
  };

  const iniciarReprogramacion = (t: Turno) => {
    setTurnoIdAReprogramar(t.id);
    setManualNombre(t.paciente_nombre);
    setManualDni(t.paciente_dni || '');
    setManualTelefono(t.telefono || '');
    setManualProf(t.profesional || 'Od. Sofía Martínez');
    setManualEsp(t.especialidad || 'Cirugía Maxilofacial');
    setManualMotivo(t.motivo || 'Reprogramación de Turno');
    setTurnoDetalle(null);
    setMostrarModalManual(true);
  };

  const handleCambioOdontologoManual = (nombreDoc: string) => {
    setManualProf(nombreDoc);
    const docObj = odontologosLista.find(d => d.nombre === nombreDoc);
    if (docObj) setManualEsp(docObj.especialidad);
  };

  const enviarWhatsAppConfirmacion = (turno: Turno) => {
    const numLimpio = (turno.telefono || '').replace(/\D/g, '');
    if (!numLimpio) {
      alert('El paciente no cuenta con un número de WhatsApp válido.');
      return;
    }

    const textoWA =
      `*Confirmación de Turno — ${config?.nombreClinica || 'MeDent'}* 🩺\n\n` +
      `Estimado/a *${turno.paciente_nombre}*,\n` +
      `Le confirmamos su cita agendada para el tratamiento de *${turno.motivo || 'Consulta Odontológica'}*.\n\n` +
      `👨‍⚕️ *Profesional:* ${turno.profesional || 'Odontología General'}\n` +
      `📅 *Fecha:* ${turno.fecha_arg || turno.fecha}\n` +
      `⏰ *Hora:* ${turno.hora} hs\n` +
      `📍 *Ubicación:* ${config?.direccion || 'Consultorio MeDent'}\n\n` +
      `Ante cualquier consulta estamos a su disposición. ¡Le esperamos!`;

    const url = `https://wa.me/${numLimpio}?text=${encodeURIComponent(textoWA)}`;
    window.open(url, '_blank');
  };

  const ejecutarCreacionTurnoManual = async (cancelarTurnoId?: number) => {
    setGuardandoTurno(true);
    const fechaFormatted = `${manualDia.padStart(2, '0')}/${manualMes.padStart(2, '0')}/${manualAnio}`;
    const idAEnviar = cancelarTurnoId || turnoIdAReprogramar || undefined;

    const nuevoObj: Turno = {
      id: Date.now(),
      paciente_nombre: manualNombre,
      paciente_dni: manualDni,
      telefono: manualTelefono,
      fecha: fechaFormatted,
      fecha_arg: fechaFormatted,
      hora: manualHora,
      especialidad: manualEsp,
      profesional: manualProf,
      motivo: manualMotivo || 'Reserva Manual por Agenda Interna',
      estado: 'Confirmado'
    };

    const locales = JSON.parse(localStorage.getItem('medent_turnos_locales') || '[]');
    const filtradosLocales = idAEnviar ? locales.filter((t: Turno) => t.id !== idAEnviar) : locales;
    localStorage.setItem('medent_turnos_locales', JSON.stringify([...filtradosLocales, nuevoObj]));

    try {
      await fetch('https://medent-backend.onrender.com/api/turnos/solicitar-directo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoObj,
          cancelar_turno_id: idAEnviar
        })
      });
    } catch {
      console.log('Modo fallback local activado');
    } finally {
      setMostrarModalManual(false);
      setTurnoIdAReprogramar(null);
      enviarWhatsAppConfirmacion(nuevoObj);
      setManualNombre('');
      setManualDni('');
      setManualTelefono('');
      setManualMotivo('');
      setGuardandoTurno(false);
      cargarTurnos();
    }
  };

  const handleFormSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNombre || !manualTelefono || !manualHora) {
      return alert('Completa Nombre, WhatsApp y Hora obligatorios.');
    }
    await ejecutarCreacionTurnoManual();
  };

  const cancelarTurnoDirecto = async (id: number) => {
    if (!confirm('¿Seguro que deseas cancelar este turno?')) return;
    
    const locales = JSON.parse(localStorage.getItem('medent_turnos_locales') || '[]');
    const actualizados = locales.filter((t: Turno) => t.id !== id);
    localStorage.setItem('medent_turnos_locales', JSON.stringify(actualizados));

    setTurnos(prev => prev.filter(t => t.id !== id));
    if (turnoDetalle?.id === id) setTurnoDetalle(null);

    try {
      await fetch(`https://medent-backend.onrender.com/api/turnos/${id}/cancelar`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      console.log('Cancelación realizada localmente');
    }
    alert('✅ Turno cancelado.');
  };

  const irAHistoriaClinica = (nombrePaciente: string) => {
    router.push(`/pacientes?buscar=${encodeURIComponent(nombrePaciente)}`);
  };

  if (!mounted) return null;

  const esAdmin = sesion?.rol === 'admin';

  const turnosFiltrados = turnos.filter(t => {
    if (t.estado === 'Cancelado' || t.estado === 'CANCELADO') return false;
    if (odontologoSel === 'Todos los Odontólogos') return true;

    const nombreLimpioSel = (odontologoSel || '').replace('Od. ', '').trim().toLowerCase();
    const docTurnoLimpio = (t.profesional || '').replace('Od. ', '').trim().toLowerCase();

    if (!docTurnoLimpio || docTurnoLimpio === 'odontología general') return true;
    return docTurnoLimpio.includes(nombreLimpioSel) || nombreLimpioSel.includes(docTurnoLimpio);
  });

  return (
    <div className={`min-h-screen bg-slate-100 text-gray-800 flex flex-col justify-between ${config?.tipoTipografia || ''}`}>
      <style jsx global>{`
        @media print {
          @page { size: portrait; margin: 1cm; }
          header, footer, .no-print { display: none !important; }
          body { background-color: white !important; padding: 0 !important; }
          .print-area { box-shadow: none !important; border: none !important; width: 100% !important; }
        }
      `}</style>

      {/* HEADER SUPERIOR CON PERMISOS POR ROL */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex flex-col lg:flex-row justify-between items-center gap-3 no-print">
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <Link href="/" className="flex flex-col hover:opacity-90 transition-opacity cursor-pointer">
            <h1 className="text-2xl font-black tracking-tight leading-none">{config?.nombreClinica || 'MeDent'}</h1>
            <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">
              AGENDA INTERNA DE CONTROL
            </p>
          </Link>

          {sesion && (
            <div className="bg-blue-700/80 border border-blue-400/50 px-3 py-1.5 rounded-xl text-left">
              <span className="block text-[9px] uppercase font-black text-blue-200 tracking-wider">
                Perfil: {sesion.rol === 'admin' ? '🛡️ Administrador' : sesion.rol === 'odontologo' ? '👨‍⚕️ Odontólogo' : '📋 Recepción'}
              </span>
              <span className="text-xs font-bold text-white">{sesion.nombre}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-end w-full lg:w-auto">
          <button
            onClick={() => { setTurnoIdAReprogramar(null); setMostrarModalManual(true); }}
            className="bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs py-2 px-3 rounded-xl border border-blue-400 shadow-sm transition-colors cursor-pointer"
          >
            + Agendar Turno
          </button>

          <button
            onClick={cargarTurnos}
            className="bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs py-2 px-3 rounded-xl border border-blue-400 transition-colors cursor-pointer"
          >
            🔄 Actualizar
          </button>

          <button
            onClick={() => window.print()}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs py-2 px-3 rounded-xl border border-indigo-400 shadow-sm transition-colors cursor-pointer"
          >
            🖨️ Imprimir
          </button>

          <Link href="/pacientes" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-sm transition-colors">
            👥 Historias
          </Link>

          {/* SOLO VISIBLE PARA ADMINISTRADORES */}
          {esAdmin && (
            <>
              <Link href="/dashboard" className="bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs py-2 px-3 rounded-xl border border-blue-400 transition-colors">
                📊 Dashboard
              </Link>

              <Link href="/configuracion" className="bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs py-2 px-3 rounded-xl border border-blue-400 transition-colors">
                ⚙️ Config
              </Link>
            </>
          )}

          <Link href="/" className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-2 px-3 rounded-xl border border-slate-700 transition-colors">
            🏠 Inicio
          </Link>

          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            🚪 Salir
          </button>
        </div>
      </header>

      {/* MODAL DETALLE DEL TURNO */}
      {turnoDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-blue-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📋</span>
                <h3 className="text-base font-black text-blue-950">Ficha Informativa de la Cita</h3>
              </div>
              <button onClick={() => setTurnoDetalle(null)} className="text-gray-400 hover:text-gray-600 font-black text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Paciente</span>
                <p className="text-sm font-black text-blue-900">{turnoDetalle.paciente_nombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">DNI / Documento</span>
                  <p className="font-bold text-gray-800">{turnoDetalle.paciente_dni || 'No Registrado'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">WhatsApp</span>
                  <p className="font-black text-emerald-700">📱 {turnoDetalle.telefono || 'Sin datos'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Fecha y Hora</span>
                  <p className="font-bold text-gray-900">{turnoDetalle.fecha_arg || turnoDetalle.fecha} — {turnoDetalle.hora} hs</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Odontólogo</span>
                  <p className="font-bold text-purple-900">{turnoDetalle.profesional || 'Odontología General'}</p>
                </div>
              </div>

              <div className="pt-1 border-t border-gray-200">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Motivo / Práctica</span>
                <p className="font-medium text-gray-700 italic bg-white p-2.5 rounded-xl border mt-1">
                  &quot;{turnoDetalle.motivo || 'Consulta General'}&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => enviarWhatsAppConfirmacion(turnoDetalle)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-2.5 px-2 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              >
                📱 Notificar por WA
              </button>

              <button
                onClick={() => iniciarReprogramacion(turnoDetalle)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] py-2.5 px-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                🔄 Reprogramar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => irAHistoriaClinica(turnoDetalle.paciente_nombre)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] py-2.5 px-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                📖 Ver Historia
              </button>

              <button
                onClick={() => cancelarTurnoDirecto(turnoDetalle.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] py-2.5 px-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancelar Cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGENDAR / REPROGRAMAR TURNO */}
      {mostrarModalManual && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-blue-900">
                {turnoIdAReprogramar ? '🔄 Reprogramar Turno' : '🗓️ Agendar Turno Manual'}
              </h3>
              <button onClick={() => setMostrarModalManual(false)} className="text-gray-400 hover:text-gray-600 font-black text-sm">✕</button>
            </div>

            <form onSubmit={handleFormSubmitManual} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Nombre Paciente *</label>
                  <input type="text" value={manualNombre} onChange={(e) => setManualNombre(e.target.value)} required placeholder="Ej. Ana Martínez" className="w-full text-xs border rounded-xl p-2.5 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">DNI (Opcional)</label>
                  <input type="text" value={manualDni} onChange={(e) => setManualDni(e.target.value)} placeholder="Ej. 35123456" className="w-full text-xs border rounded-xl p-2.5 bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">📱 WhatsApp / Teléfono *</label>
                <input type="tel" value={manualTelefono} onChange={(e) => setManualTelefono(e.target.value)} required placeholder="Ej. 03511234567" className="w-full text-xs border border-emerald-400 rounded-xl p-2.5 bg-white font-bold text-emerald-800" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Odontólogo y Especialidad *</label>
                <select 
                  value={manualProf} 
                  onChange={(e) => handleCambioOdontologoManual(e.target.value)} 
                  className="w-full text-xs border rounded-xl p-2.5 font-bold bg-purple-50 text-purple-900"
                >
                  {odontologosLista.map(od => (
                    <option key={od.id} value={od.nombre}>
                      {od.nombre} — {od.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 space-y-2">
                <label className="block text-[11px] font-black text-blue-900">📅 Seleccionar Nueva Fecha y Horario</label>
                <div className="grid grid-cols-4 gap-2">
                  <select value={manualDia} onChange={(e) => setManualDia(e.target.value)} className="text-xs font-bold border rounded-xl p-2 bg-white">
                    {Array.from({ length: 31 }, (_, i) => {
                      const v = String(i + 1).padStart(2, '0');
                      return <option key={v} value={v}>{v}</option>;
                    })}
                  </select>
                  <select value={manualMes} onChange={(e) => setManualMes(e.target.value)} className="text-xs font-bold border rounded-xl p-2 bg-white">
                    {MESES.map(m => <option key={m.num} value={m.num}>{m.nombre}</option>)}
                  </select>
                  <select value={manualAnio} onChange={(e) => setManualAnio(e.target.value)} className="text-xs font-bold border rounded-xl p-2 bg-white">
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                  <select value={manualHora} onChange={(e) => setManualHora(e.target.value)} className="text-xs font-bold border rounded-xl p-2 bg-white">
                    {HORARIOS.map(h => <option key={h} value={h}>{h} hs</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Motivo / Práctica</label>
                <input type="text" value={manualMotivo} onChange={(e) => setManualMotivo(e.target.value)} placeholder="Ej. Odontología General / Consulta" className="w-full text-xs border rounded-xl p-2.5 bg-white" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" disabled={guardandoTurno} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer">
                  {guardandoTurno ? 'Procesando...' : (turnoIdAReprogramar ? 'Confirmar Reprogramación' : 'Confirmar Turno y Notificar WA 📱')}
                </button>
                <button type="button" onClick={() => setMostrarModalManual(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl cursor-pointer">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
        
        {/* BARRA SUPERIOR DE CONTROL */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 space-y-3 no-print">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => desplazarFecha(-1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm px-3 py-1.5 rounded-xl border">◀</button>
              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs font-black px-3.5 py-1.5 rounded-xl">
                {modoVista === 'dia' && `📅 DÍA: ${formatoFechaArg(fechaActual)}`}
                {modoVista === 'semana' && `📆 SEMANA: ${DIAS_SEMANA[0]?.label} — ${DIAS_SEMANA[4]?.label}`}
                {modoVista === 'mes' && `🗓️ MES: ${MESES[fechaActual.getMonth()].nombre.toUpperCase()} ${fechaActual.getFullYear()}`}
              </div>
              <button onClick={() => desplazarFecha(1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm px-3 py-1.5 rounded-xl border">▶</button>
              <button onClick={irAHoy} className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-sm">Hoy</button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 mr-1.5">Odontólogo:</span>
                <select value={odontologoSel} onChange={(e) => setOdontologoSel(e.target.value)} className="text-xs font-extrabold border border-purple-300 rounded-xl p-2 bg-purple-50 text-purple-900 outline-none">
                  <option value="Todos los Odontólogos">Todos los Odontólogos</option>
                  {odontologosLista.map(od => (
                    <option key={od.id} value={od.nombre}>{od.nombre} ({od.especialidad})</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 mr-1.5">Área:</span>
                <select value={especialidadSel} onChange={(e) => setEspecialidadSel(e.target.value)} className="text-xs font-bold border border-gray-300 rounded-xl p-2 bg-slate-50 text-gray-800 outline-none">
                  <option value="Todas las Especialidades">Todas las Especialidades</option>
                  <option value="Cirugía Maxilofacial">Cirugía Maxilofacial</option>
                  <option value="Odontología General">Odontología General</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Guardia">Guardia</option>
                </select>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button onClick={() => setModoVista('dia')} className={`text-xs font-black px-3 py-1 rounded-xl transition-all ${modoVista === 'dia' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Día</button>
              <button onClick={() => setModoVista('semana')} className={`text-xs font-black px-3 py-1 rounded-xl transition-all ${modoVista === 'semana' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Semana</button>
              <button onClick={() => setModoVista('mes')} className={`text-xs font-black px-3 py-1 rounded-xl transition-all ${modoVista === 'mes' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Mes</button>
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL IMPRIMIBLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden print-area">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-wide">
              AGENDA {modoVista.toUpperCase()}: {odontologoSel.toUpperCase()} — {formatoFechaArg(fechaActual)}
            </h2>
            <div className="flex items-center gap-3">
              {cargando && <span className="text-xs font-bold text-blue-600 animate-pulse no-print">Sincronizando...</span>}
              <span className="text-xs font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-xl">
                {turnosFiltrados.length} Turnos
              </span>
            </div>
          </div>

          {/* 1. VISTA DÍA */}
          {modoVista === 'dia' && (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-black text-gray-700 border-b">
                    <th className="p-3 w-32 text-center">HORA</th>
                    <th className="p-3">PACIENTE</th>
                    <th className="p-3">TELÉFONO / WHATSAPP</th>
                    <th className="p-3">ODONTÓLOGO / ESPECIALIDAD</th>
                    <th className="p-3">MOTIVO</th>
                    <th className="p-3 text-right no-print">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {HORARIOS.map(h => {
                    const argActual = formatoFechaArg(fechaActual);
                    const isoActual = formatoFechaISO(fechaActual);
                    const turnoEncontrado = turnosFiltrados.find(t => {
                      const mismaFecha = (t.fecha === argActual || t.fecha === isoActual || t.fecha_arg === argActual);
                      const mismaHora = (t.hora || '').slice(0, 5) === h;
                      return mismaFecha && mismaHora;
                    });

                    return (
                      <tr key={h} className="hover:bg-slate-50">
                        <td className="p-2 border-r text-center bg-slate-50">
                          <button
                            onClick={() => abrirModalParaHorario(h)}
                            className="w-full font-extrabold text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-lg text-[11px] cursor-pointer"
                          >
                            ⏰ {h} hs ➕
                          </button>
                        </td>
                        <td className="p-3 font-black text-blue-950">
                          {turnoEncontrado ? (
                            <button
                              onClick={() => setTurnoDetalle(turnoEncontrado)}
                              onDoubleClick={() => irAHistoriaClinica(turnoEncontrado.paciente_nombre)}
                              className="hover:underline hover:text-blue-600 text-left cursor-pointer"
                            >
                              {turnoEncontrado.paciente_nombre}
                            </button>
                          ) : (
                            <button onClick={() => abrirModalParaHorario(h)} className="text-gray-400 italic hover:underline cursor-pointer">
                              Disponible — Clic para agendar
                            </button>
                          )}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          {turnoEncontrado ? `📱 ${turnoEncontrado.telefono || 'Sin datos'}` : '-'}
                        </td>
                        <td className="p-3 text-gray-700 font-medium">
                          {turnoEncontrado ? `${turnoEncontrado.profesional || 'Odontología General'}` : '-'}
                        </td>
                        <td className="p-3 text-gray-500">
                          {turnoEncontrado ? (turnoEncontrado.motivo || 'Consulta General') : '-'}
                        </td>
                        <td className="p-3 text-right no-print">
                          {turnoEncontrado && (
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => enviarWhatsAppConfirmacion(turnoEncontrado)} className="text-[10px] bg-emerald-600 text-white font-black px-2 py-1 rounded-lg">📱 WA</button>
                              <button onClick={() => iniciarReprogramacion(turnoEncontrado)} className="text-[10px] bg-amber-500 text-white font-black px-2 py-1 rounded-lg">🔄</button>
                              <button onClick={() => cancelarTurnoDirecto(turnoEncontrado.id)} className="text-[10px] bg-red-600 text-white font-black px-2 py-1 rounded-lg">✕</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. VISTA SEMANA */}
          {modoVista === 'semana' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-black text-gray-700 border-b">
                    <th className="p-3 border-r w-28 text-center">HORA</th>
                    {DIAS_SEMANA.map(d => (
                      <th key={d.fecha_arg} className="p-3 border-r text-center w-1/5">
                        <div>{d.nombre}</div>
                        <div className="text-[10px] font-bold text-blue-600">{d.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {HORARIOS.map(h => (
                    <tr key={h} className="hover:bg-slate-50/50">
                      <td className="p-1 border-r text-center bg-slate-50">
                        <button
                          onClick={() => abrirModalParaHorario(h)}
                          className="w-full text-center font-bold text-gray-600 hover:text-blue-700 hover:bg-blue-100 py-1.5 rounded-lg text-[11px] cursor-pointer"
                        >
                          ⏰ {h}
                        </button>
                      </td>

                      {DIAS_SEMANA.map(d => {
                        const turnoEncontrado = turnosFiltrados.find(t => {
                          const mismaFecha = (
                            t.fecha === d.fecha_arg || 
                            t.fecha === d.fecha_iso || 
                            t.fecha_arg === d.fecha_arg
                          );
                          const mismaHora = (t.hora || '').slice(0, 5) === h;
                          return mismaFecha && mismaHora;
                        });

                        return (
                          <td key={d.fecha_arg} className="p-1.5 border-r h-16 vertical-top">
                            {turnoEncontrado ? (
                              <div className="bg-blue-600 text-white p-2 rounded-2xl text-[11px] shadow-sm space-y-1 relative group">
                                <button
                                  onClick={() => setTurnoDetalle(turnoEncontrado)}
                                  onDoubleClick={() => irAHistoriaClinica(turnoEncontrado.paciente_nombre)}
                                  className="font-black truncate block w-full text-left hover:underline cursor-pointer"
                                >
                                  {turnoEncontrado.paciente_nombre}
                                </button>
                                <div className="text-[10px] text-blue-100 font-medium truncate">
                                  📱 {turnoEncontrado.telefono || 'Sin WhatsApp'}
                                </div>
                                <div className="flex justify-between items-center pt-0.5">
                                  <span className="text-[9px] bg-blue-800 px-1.5 py-0.5 rounded-md font-bold truncate max-w-[90px]">
                                    {turnoEncontrado.motivo || 'Odontología General'}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => enviarWhatsAppConfirmacion(turnoEncontrado)}
                                      className="text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black cursor-pointer no-print"
                                      title="Enviar WhatsApp"
                                    >
                                      📱
                                    </button>
                                    <button
                                      onClick={() => cancelarTurnoDirecto(turnoEncontrado.id)}
                                      className="text-[9px] bg-red-500 hover:bg-red-700 text-white px-1.5 py-0.5 rounded font-black cursor-pointer no-print"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => abrirModalParaHorario(h, d.fecha_arg)}
                                className="h-full w-full border border-dashed border-gray-100 hover:border-blue-400 bg-slate-50/30 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer flex items-center justify-center text-gray-300 hover:text-blue-600 font-bold text-[10px]"
                              >
                                + Agendar
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. VISTA MES */}
          {modoVista === 'mes' && (
            <div className="p-4 space-y-4 overflow-x-auto">
              <div className="min-w-[600px] space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-600 border-b pb-2">
                  <div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {DIAS_MES.map(item => {
                    const turnosDelDia = turnosFiltrados.filter(t => t.fecha === item.fechaArg || t.fecha === item.fechaISO);
                    const esHoy = item.fechaArg === '06/11/2026';

                    return (
                      <div
                        key={item.fechaISO}
                        onClick={() => {
                          setFechaActual(new Date(item.fechaISO + 'T00:00:00'));
                          setModoVista('dia');
                        }}
                        className={`min-h-[90px] border rounded-2xl p-2.5 flex flex-col justify-between transition-all cursor-pointer hover:border-blue-500 ${
                          esHoy ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400' : 'bg-slate-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-black ${esHoy ? 'text-blue-900 font-extrabold' : 'text-gray-700'}`}>
                            {item.diaNum}
                          </span>
                          {esHoy && <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">HOY</span>}
                        </div>

                        <div>
                          {turnosDelDia.length > 0 ? (
                            <div className="bg-blue-600 text-white text-[10px] font-black p-1 rounded-lg text-center shadow-sm">
                              {turnosDelDia.length} Turno(s)
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 text-center font-medium">Sin turnos</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400 border-t bg-white mt-6 no-print">
        {config?.nombreClinica || 'MeDent'} SaaS Odontológico — Sistema Integral de Agenda e Historias Clínicas
      </footer>
    </div>
  );
}