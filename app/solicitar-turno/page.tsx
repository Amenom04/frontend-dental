'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';

interface TurnoAgendado {
  id: number;
  fecha: string;
  hora: string;
  paciente: string;
  dni: string;
  telefono: string;
  email?: string;
  obraSocial: string;
  practica: string;
  odontologo: string;
  estado: 'Confirmado' | 'Esperando' | 'En Atención' | 'Finalizado' | 'Cancelado';
}

export default function SolicitarTurnoPage() {
  const { config, practicas, odontologos } = useConfig() as any;
  const [mounted, setMounted] = useState(false);

  // Pasos del formulario público (1: Especialidad/Odontólogo/Horario, 2: Datos del Paciente, 3: Confirmación)
  const [paso, setPaso] = useState<1 | 2 | 3>(1);

  // Catálogos dinámicos desde ConfigContext con respaldo por defecto
  const listaPracticas: string[] =
    practicas && practicas.length > 0
      ? practicas.map((p: any) => (typeof p === 'string' ? p : p.nombre))
      : [
          'Odontología General / Consulta',
          'Limpieza Dental / Profilaxis',
          'Consulta por Ortodoncia',
          'Cirugía Maxilofacial',
          'Guardia / Urgencia Dental',
          'Diagnóstico Radiológico (Pantomografía)'
        ];

  const listaOdontologosBase: { nombre: string; especialidad?: string; practicas?: string[] }[] =
    odontologos && odontologos.length > 0
      ? odontologos.map((o: any) =>
          typeof o === 'string'
            ? { nombre: o, especialidad: 'Todas' }
            : {
                nombre: o.nombre || 'Od. Principal',
                especialidad: o.especialidad || 'Todas',
                practicas: o.practicas || []
              }
        )
      : [
          { nombre: 'Od. Principal', especialidad: 'Todas' },
          { nombre: 'Dra. Laura Gómez', especialidad: 'Ortodoncia' },
          { nombre: 'Dr. Martín Pérez', especialidad: 'Cirugía Maxilofacial' }
        ];

  // Estados de Selección (Paso 1)
  const [practicaSeleccionada, setPracticaSeleccionada] = useState<string>(listaPracticas[0]);
  const [odontologoSeleccionado, setOdontologoSeleccionado] = useState<string>('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');

  // Estados de Datos del Paciente (Paso 2)
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [dniPaciente, setDniPaciente] = useState('');
  const [telefonoPaciente, setTelefonoPaciente] = useState('');
  const [emailPaciente, setEmailPaciente] = useState('');
  const [obraSocial, setObraSocial] = useState('Particular');
  const [enviando, setEnviando] = useState(false);
  const [turnosExistentes, setTurnosExistentes] = useState<TurnoAgendado[]>([]);

  const horariosDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00',
    '10:30', '11:00', '11:30', '12:00', '13:00',
    '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00',
    '18:30'
  ];

  // Filtrar odontólogos habilitados para la práctica seleccionada (o mostrar todos si atienden todas)
  const odontologosFiltrados = listaOdontologosBase.filter((od) => {
    if (!od.especialidad || od.especialidad === 'Todas') return true;
    if (od.practicas && od.practicas.length > 0) {
      return od.practicas.includes(practicaSeleccionada);
    }
    return practicaSeleccionada.toLowerCase().includes(od.especialidad.toLowerCase()) || true;
  });

  useEffect(() => {
    setMounted(true);
    const guardados = localStorage.getItem('medent_turnos');
    if (guardados) {
      setTurnosExistentes(JSON.parse(guardados));
    }
  }, []);

  // Actualizar odontólogo por defecto cuando cambia la práctica o carga la lista
  useEffect(() => {
    if (odontologosFiltrados.length > 0) {
      const sigueValido = odontologosFiltrados.some((o) => o.nombre === odontologoSeleccionado);
      if (!sigueValido) {
        setOdontologoSeleccionado(odontologosFiltrados[0].nombre);
      }
    }
  }, [practicaSeleccionada, odontologosFiltrados, odontologoSeleccionado]);

  // Verificar si un horario ya está reservado para ese odontólogo y fecha
  const estaOcupado = (hora: string) => {
    return turnosExistentes.some(
      (t) =>
        t.fecha === fechaSeleccionada &&
        t.hora === hora &&
        t.odontologo === odontologoSeleccionado &&
        t.estado !== 'Cancelado'
    );
  };

  const handleConfirmarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombrePaciente.trim() || !telefonoPaciente.trim()) {
      return alert('Por favor completa tu nombre y teléfono de contacto.');
    }

    setEnviando(true);

    const nuevoTurno: TurnoAgendado = {
      id: Date.now(),
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
      paciente: nombrePaciente.trim(),
      dni: dniPaciente.trim() || 'Sin especificar',
      telefono: telefonoPaciente.trim(),
      email: emailPaciente.trim(),
      obraSocial: obraSocial.trim() || 'Particular',
      practica: practicaSeleccionada,
      odontologo: odontologoSeleccionado,
      estado: 'Confirmado'
    };

    try {
      // Guardar en almacenamiento local sincronizado con la Agenda Interna (/turnos)
      const actualizados = [nuevoTurno, ...turnosExistentes];
      setTurnosExistentes(actualizados);
      localStorage.setItem('medent_turnos', JSON.stringify(actualizados));

      // Intentar envío al Backend en Render (silencioso si aún no existe el endpoint)
      await fetch('https://medent-backend.onrender.com/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTurno)
      }).catch(() => null);

      setPaso(3);
    } finally {
      setEnviando(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 ${config?.tipoTipografia || ''}`}
      style={{ backgroundColor: config?.colorFondo || '#f8fafc' }}
    >
      {/* HEADER PÚBLICO */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 100 100" className="fill-none flex-shrink-0">
              <path
                d="M 50,22 C 38,12 20,15 20,38 C 20,60 25,70 38,90 C 42,80 38,60 48,50 L 52,68 L 68,42"
                stroke={config?.colorPrimario || '#2563eb'}
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50,22 C 62,12 80,15 80,38 C 80,60 75,70 62,90 L 56,76"
                stroke="#1e293b"
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 leading-tight">
                {config?.nombreClinica || 'MeDent Clínica Odontológica'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config?.colorPrimario || '#2563eb' }}>
                SOLICITUD PÚBLICA DE CITA
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-3xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reserva tu Cita Dental</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Selecciona la práctica, el profesional de tu preferencia y confirma el horario de forma directa.
          </p>
        </div>

        {/* PASO 1: PRÁCTICA, ODONTÓLOGO, FECHA Y HORARIO */}
        {paso === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-3">
              1. SELECCIONA PRÁCTICA, PROFESIONAL Y HORARIO
            </h2>

            {/* SELECTOR DE PRÁCTICA / ESPECIALIDAD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  🦷 Práctica / Especialidad *
                </label>
                <select
                  value={practicaSeleccionada}
                  onChange={(e) => {
                    setPracticaSeleccionada(e.target.value);
                    setHoraSeleccionada('');
                  }}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {listaPracticas.map((practica, idx) => (
                    <option key={idx} value={practica}>
                      {practica}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECTOR DE ODONTÓLOGO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  👨‍⚕️ Profesional / Odontólogo *
                </label>
                <select
                  value={odontologoSeleccionado}
                  onChange={(e) => {
                    setOdontologoSeleccionado(e.target.value);
                    setHoraSeleccionada('');
                  }}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {odontologosFiltrados.map((od, idx) => (
                    <option key={idx} value={od.nombre}>
                      {od.nombre} {od.especialidad && od.especialidad !== 'Todas' ? `(${od.especialidad})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SELECTOR DE FECHA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                📅 Fecha de Atención *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={fechaSeleccionada}
                onChange={(e) => {
                  setFechaSeleccionada(e.target.value);
                  setHoraSeleccionada('');
                }}
                className="w-full sm:w-1/2 text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* GRILLA DE HORARIOS DISPONIBLES */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">
                  ⏰ Horarios Disponibles para <span className="text-blue-600">{odontologoSeleccionado}</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  Gris = Ocupado
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                {horariosDisponibles.map((hora) => {
                  const ocupado = estaOcupado(hora);
                  const seleccionado = horaSeleccionada === hora;

                  return (
                    <button
                      key={hora}
                      type="button"
                      disabled={ocupado}
                      onClick={() => setHoraSeleccionada(hora)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all ${
                        ocupado
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : seleccionado
                          ? 'text-white shadow-md scale-105'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 cursor-pointer'
                      }`}
                      style={
                        seleccionado && !ocupado
                          ? {
                              backgroundColor: config?.colorPrimario || '#2563eb',
                              borderColor: config?.colorPrimario || '#2563eb'
                            }
                          : {}
                      }
                    >
                      {hora} hs
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BOTÓN CONTINUAR AL PASO 2 */}
            <div className="pt-4 border-t flex justify-end">
              <button
                type="button"
                disabled={!horaSeleccionada || !odontologoSeleccionado}
                onClick={() => setPaso(2)}
                className={`text-white font-black text-xs px-8 py-3.5 rounded-xl shadow-md transition-all ${
                  !horaSeleccionada
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'hover:scale-105 cursor-pointer'
                }`}
                style={
                  horaSeleccionada
                    ? { backgroundColor: config?.colorPrimario || '#2563eb' }
                    : {}
                }
              >
                Siguiente: Mis Datos →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: DATOS PERSONALES DEL PACIENTE */}
        {paso === 2 && (
          <form onSubmit={handleConfirmarCita} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                2. COMPLETA TUS DATOS PERSONALES
              </h2>
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                ← Cambiar Horario / Profesional
              </button>
            </div>

            {/* RESUMEN DE LA SELECCIÓN */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 block">Práctica</span>
                <span className="font-black text-slate-900">{practicaSeleccionada}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 block">Profesional</span>
                <span className="font-black text-slate-900">{odontologoSeleccionado}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 block">Fecha y Hora</span>
                <span className="font-black text-slate-900">{fechaSeleccionada} — {horaSeleccionada} hs</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  value={nombrePaciente}
                  onChange={(e) => setNombrePaciente(e.target.value)}
                  placeholder="Ej. María Fernández"
                  className="w-full font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">DNI / Documento *</label>
                <input
                  type="text"
                  required
                  value={dniPaciente}
                  onChange={(e) => setDniPaciente(e.target.value)}
                  placeholder="Ej. 34567890"
                  className="w-full font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={telefonoPaciente}
                  onChange={(e) => setTelefonoPaciente(e.target.value)}
                  placeholder="Ej. 3511234567"
                  className="w-full font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Obra Social / Prepaga</label>
                <input
                  type="text"
                  value={obraSocial}
                  onChange={(e) => setObraSocial(e.target.value)}
                  placeholder="Particular / OSDE / Swiss Medical..."
                  className="w-full font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                type="submit"
                disabled={enviando}
                className="w-full sm:w-auto text-white font-black text-xs px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
                style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}
              >
                {enviando ? 'Registrando Turno...' : '✅ Confirmar Reserva de Turno'}
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: COMPROBANTE DE RESERVA EXITOSA */}
        {paso === 3 && (
          <div className="bg-white p-8 rounded-3xl shadow-md border border-emerald-200 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✅
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">¡Turno Confirmado!</h2>
              <p className="text-xs text-slate-500 font-medium">
                Tu cita ya quedó agendada en el sistema de la clínica.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <p><strong className="text-slate-700">Paciente:</strong> {nombrePaciente}</p>
              <p><strong className="text-slate-700">Práctica:</strong> {practicaSeleccionada}</p>
              <p><strong className="text-slate-700">Odontólogo:</strong> {odontologoSeleccionado}</p>
              <p><strong className="text-slate-700">Fecha y Horario:</strong> {fechaSeleccionada} a las {horaSeleccionada} hs</p>
              <p><strong className="text-slate-700">Cobertura:</strong> {obraSocial}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/"
                className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs px-6 py-3 rounded-xl transition-colors"
              >
                Volver a la Portada
              </Link>
              <button
                type="button"
                onClick={() => {
                  setPaso(1);
                  setHoraSeleccionada('');
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs px-6 py-3 rounded-xl border border-blue-200 transition-colors"
              >
                Reservar Otro Turno
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-6 text-center text-xs text-slate-400">
        {config?.nombreClinica || 'MeDent Clínica Odontológica'} — Canal Oficial de Solicitud de Citas
      </footer>
    </div>
  );
}