'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Turno {
  id: number;
  paciente_id?: number;
  paciente_nombre: string;
  paciente_dni?: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM
  motivo?: string;
  estado?: string;
}

export default function TurnosPage() {
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de Vista de la Agenda (Inicialización compatible con SSR/Client)
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('mes');
  const [fechaActual, setFechaActual] = useState<Date | null>(null);

  // Modal Nuevo Turno
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [pacienteDni, setPacienteDni] = useState('');
  const [fechaTurno, setFechaTurno] = useState('');
  const [horaTurno, setHoraTurno] = useState('09:00');
  const [motivoTurno, setMotivoTurno] = useState('');

  // Buscador
  const [busqueda, setBusqueda] = useState('');

  // Sincronizar fecha en cliente para evitar diferencias de SSR
  useEffect(() => {
    const hoy = new Date();
    setFechaActual(hoy);
    setFechaTurno(hoy.toISOString().split('T')[0]);
  }, []);

  // Cargar turnos desde Backend
  const cargarTurnos = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/turnos');
      if (res.ok) {
        const data = await res.json();
        setTurnos(data);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  const handleCrearTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteNombre || !fechaTurno || !horaTurno) {
      return alert('Por favor completa el nombre, fecha y hora.');
    }

    try {
      const res = await fetch('http://localhost:4000/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_nombre: pacienteNombre,
          paciente_dni: pacienteDni,
          fecha: fechaTurno,
          hora: horaTurno,
          motivo: motivoTurno,
          estado: 'Confirmado'
        })
      });

      if (res.ok) {
        setPacienteNombre('');
        setPacienteDni('');
        setMotivoTurno('');
        setModalNuevoOpen(false);
        await cargarTurnos();
      }
    } catch (error) {
      console.error('Error al guardar el turno:', error);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  // NAVEGACIÓN DE FECHAS
  const navegarFecha = (direccion: number) => {
    if (!fechaActual) return;
    const nueva = new Date(fechaActual);
    if (vista === 'dia') {
      nueva.setDate(nueva.getDate() + direccion);
    } else if (vista === 'semana') {
      nueva.setDate(nueva.getDate() + direccion * 7);
    } else if (vista === 'mes') {
      nueva.setMonth(nueva.getMonth() + direccion);
    }
    setFechaActual(nueva);
  };

  const formatearFechaArg = (fechaStr: string) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('T')[0].split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
  };

  // Filtrado de turnos
  const turnosFiltrados = turnos.filter(t => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      t.paciente_nombre?.toLowerCase().includes(q) ||
      t.paciente_dni?.includes(q) ||
      t.motivo?.toLowerCase().includes(q)
    );
  });

  // Generador de Grilla Mensual
  const obtenerDiasMes = () => {
    if (!fechaActual) return [];
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    
    const primerDiaMes = new Date(año, mes, 1);
    const ultimoDiaMes = new Date(año, mes + 1, 0);

    let diaInicio = primerDiaMes.getDay() - 1;
    if (diaInicio === -1) diaInicio = 6;

    const dias = [];
    for (let i = diaInicio; i > 0; i--) {
      const d = new Date(año, mes, 1 - i);
      dias.push({ fecha: d, esMesActual: false });
    }

    for (let i = 1; i <= ultimoDiaMes.getDate(); i++) {
      const d = new Date(año, mes, i);
      dias.push({ fecha: d, esMesActual: true });
    }

    return dias;
  };

  const MESES_NOMBRES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col">
      {/* CABECERA UNIFICADA DE NAVEGACIÓN GLOBAL */}
      <header className="bg-blue-600 text-white py-4 px-8 shadow-md flex justify-between items-center">
        <Link href="/" className="group cursor-pointer">
          <h1 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-100 transition-colors">
            MeDent
          </h1>
          <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">
            Clínica Odontológica — Agenda de Consultorio
          </p>
        </Link>

        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-xl text-xs border border-blue-500 transition-colors"
          >
            ← Volver al Dashboard
          </Link>

          <button
            onClick={handleCerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL AGENDA */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        
        {/* BARRA DE HERRAMIENTAS */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
          
          {/* Navegación por flechas */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navegarFecha(-1)}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl font-black text-gray-700 transition-colors"
            >
              ◀
            </button>
            
            <span className="text-sm font-black text-gray-800 min-w-[180px] text-center">
              {fechaActual && vista === 'mes' && `${MESES_NOMBRES[fechaActual.getMonth()]} de ${fechaActual.getFullYear()}`}
              {fechaActual && vista === 'dia' && fechaActual.toLocaleDateString('es-AR')}
              {fechaActual && vista === 'semana' && `Semana del ${fechaActual.getDate()} de ${MESES_NOMBRES[fechaActual.getMonth()]}`}
            </span>

            <button 
              onClick={() => navegarFecha(1)}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl font-black text-gray-700 transition-colors"
            >
              ▶
            </button>

            <button 
              onClick={() => setFechaActual(new Date())}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2 px-3 rounded-xl border border-blue-200 ml-2"
            >
              Hoy
            </button>
          </div>

          {/* Selectores de Modo de Vista */}
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button
              onClick={() => setVista('dia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vista === 'dia' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Vista Por Día
            </button>
            <button
              onClick={() => setVista('semana')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vista === 'semana' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Vista Por Semana
            </button>
            <button
              onClick={() => setVista('mes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vista === 'mes' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Vista Por Mes
            </button>
          </div>

          {/* Buscador y Botón Nuevo Turno */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-xs">🔍</span>
              <input 
                type="text"
                placeholder="Buscar Paciente o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl pl-8 pr-3 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setModalNuevoOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              + Nuevo Turno
            </button>
          </div>
        </div>

        {/* GRILLA CALENDARIO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-base font-black text-gray-800 uppercase tracking-wider">
              🗓️ CALENDARIO {vista.toUpperCase()} {fechaActual && `— ${MESES_NOMBRES[fechaActual.getMonth()]} DE ${fechaActual.getFullYear()}`}
            </h2>
            <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {turnosFiltrados.length} Turnos Registrados
            </span>
          </div>

          {/* VISTA POR MES */}
          {vista === 'mes' && (
            <div className="grid grid-cols-7 gap-2">
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(dia => (
                <div key={dia} className="text-center font-black text-[11px] text-gray-400 py-2 border-b">
                  {dia}
                </div>
              ))}

              {obtenerDiasMes().map((item, index) => {
                const fechaISO = item.fecha.toISOString().split('T')[0];
                const turnosDelDia = turnosFiltrados.filter(t => t.fecha?.split('T')[0] === fechaISO);

                return (
                  <div 
                    key={index}
                    className={`min-h-[100px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                      item.esMesActual 
                        ? 'bg-white border-gray-200 hover:border-blue-300' 
                        : 'bg-gray-50 border-gray-100 opacity-40'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-700 block">
                      {item.fecha.getDate()}
                    </span>

                    <div className="space-y-1 my-1 overflow-y-auto max-h-[60px]">
                      {turnosDelDia.map(t => (
                        <Link 
                          key={t.id}
                          href={t.paciente_id ? `/pacientes/${t.paciente_id}` : '/pacientes'}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-[10px] p-1 rounded-lg font-bold truncate block transition-colors cursor-pointer"
                          title={`Ver Ficha de ${t.paciente_nombre}`}
                        >
                          ⏰ {t.hora} hs - {t.paciente_nombre}
                        </Link>
                      ))}
                    </div>

                    {turnosDelDia.length > 0 && (
                      <span className="text-[9px] font-extrabold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md self-start">
                        {turnosDelDia.length} turnos
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VISTA POR DÍA / LISTA CON LINK AL PACIENTE */}
          {(vista === 'dia' || vista === 'semana') && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Hora</th>
                    <th className="p-3">Paciente</th>
                    <th className="p-3">DNI</th>
                    <th className="p-3">Motivo / Práctica</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {turnosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No hay turnos registrados para este criterio.
                      </td>
                    </tr>
                  ) : (
                    turnosFiltrados.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-gray-800">{formatearFechaArg(t.fecha)}</td>
                        <td className="p-3 font-black text-blue-600">⏰ {t.hora} hs</td>
                        <td className="p-3 font-bold text-blue-700">
                          <Link 
                            href={t.paciente_id ? `/pacientes/${t.paciente_id}` : '/pacientes'}
                            className="hover:underline flex items-center gap-1"
                          >
                            👤 {t.paciente_nombre}
                          </Link>
                        </td>
                        <td className="p-3 text-gray-600">{t.paciente_dni || '-'}</td>
                        <td className="p-3 text-gray-600">{t.motivo || 'Consulta General'}</td>
                        <td className="p-3">
                          <Link 
                            href={t.paciente_id ? `/pacientes/${t.paciente_id}` : '/pacientes'}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-colors inline-block"
                          >
                            Ver Ficha →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL REGISTRAR NUEVO TURNO */}
      {modalNuevoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-gray-800">🗓️ Agendar Nuevo Turno</h3>
              <button onClick={() => setModalNuevoOpen(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCrearTurno} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre y Apellido del Paciente *</label>
                <input 
                  type="text" 
                  value={pacienteNombre}
                  onChange={(e) => setPacienteNombre(e.target.value)}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">DNI del Paciente</label>
                <input 
                  type="text" 
                  value={pacienteDni}
                  onChange={(e) => setPacienteDni(e.target.value)}
                  placeholder="Ej. 12345678"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fecha *</label>
                  <input 
                    type="date" 
                    value={fechaTurno}
                    onChange={(e) => setFechaTurno(e.target.value)}
                    required
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hora *</label>
                  <input 
                    type="time" 
                    value={horaTurno}
                    onChange={(e) => setHoraTurno(e.target.value)}
                    required
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo / Práctica</label>
                <input 
                  type="text" 
                  value={motivoTurno}
                  onChange={(e) => setMotivoTurno(e.target.value)}
                  placeholder="Ej. Limpieza, Extracción, Consulta"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalNuevoOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Confirmar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}