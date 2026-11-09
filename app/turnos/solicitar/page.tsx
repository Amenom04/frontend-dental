'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TurnoConfirmadoData {
  id: number;
  paciente_nombre: string;
  fecha: string;
  hora: string;
  profesional: string;
  motivo: string;
}

export default function SolicitarTurnoPublicoPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [motivo, setMotivo] = useState('');
  
  // NUEVO ESTADO PARA LA FECHA MÍNIMA
  const [minDate, setMinDate] = useState('');

  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [errorSimultaneo, setErrorSimultaneo] = useState('');
  const [turnoConfirmado, setTurnoConfirmado] = useState<TurnoConfirmadoData | null>(null);
  const [cargando, setCargando] = useState(false);

  const HORARIOS_BASE = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  // NUEVO USE-EFFECT PARA CARGAR LA FECHA MÍNIMA SOLO EN EL CLIENTE
  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0]);
  }, []);

  const cargarDisponibilidad = async (fechaSeleccionada: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/turnos/disponibilidad?fecha=${fechaSeleccionada}`);
      if (res.ok) {
        const ocupados: string[] = await res.json();
        const libres = HORARIOS_BASE.filter(h => !ocupados.includes(h));
        setHorariosDisponibles(libres);
      } else {
        setHorariosDisponibles(HORARIOS_BASE);
      }
    } catch {
      setHorariosDisponibles(HORARIOS_BASE);
    }
  };

  useEffect(() => {
    if (fecha) {
      setHoraSeleccionada('');
      setErrorSimultaneo('');
      cargarDisponibilidad(fecha);
    }
  }, [fecha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !dni || !fecha || !horaSeleccionada) {
      return alert('Completa todos los campos obligatorios.');
    }

    setCargando(true);
    setErrorSimultaneo('');

    try {
      const res = await fetch('http://localhost:4000/api/turnos/solicitar-directo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_nombre: `${nombre} ${apellido}`.trim(),
          paciente_dni: dni,
          telefono,
          fecha,
          hora: horaSeleccionada,
          motivo: motivo || 'Consulta Odontológica General'
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        setErrorSimultaneo('⚠️ Horario no disponible. Por favor, seleccione otro horario.');
        await cargarDisponibilidad(fecha);
      } else if (res.ok) {
        setTurnoConfirmado(data);
      }
    } catch {
      alert('Error al conectar con la clínica. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-gray-200">
        
        {/* CABECERA CON LOGO */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block group cursor-pointer">
            <h1 className="text-3xl font-black text-blue-600 tracking-tight group-hover:text-blue-700 transition-colors">
              MeDent
            </h1>
          </Link>
          <p className="text-xs uppercase font-extrabold text-gray-400 tracking-widest">
            Reserva Directa de Turnos Online
          </p>
        </div>

        {/* COMPROBANTE FINAL AL CONFIRMAR */}
        {turnoConfirmado ? (
          <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-3xl space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-sm">
              ✓
            </div>
            
            <div>
              <h2 className="text-xl font-black text-emerald-900">¡Turno Confirmado con Éxito!</h2>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Su cita médica ha sido agendada automáticamente.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400 font-bold">Paciente:</span>
                <span className="font-extrabold text-gray-800">{turnoConfirmado.paciente_nombre}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400 font-bold">Fecha:</span>
                <span className="font-extrabold text-blue-700">{turnoConfirmado.fecha}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400 font-bold">Hora:</span>
                <span className="font-black text-blue-700">⏰ {turnoConfirmado.hora} hs</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400 font-bold">Profesional / Odontólogo:</span>
                <span className="font-extrabold text-gray-800">{turnoConfirmado.profesional}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Motivo:</span>
                <span className="font-bold text-gray-700">{turnoConfirmado.motivo}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setTurnoConfirmado(null);
                setFecha('');
                setHoraSeleccionada('');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors shadow-xs"
            >
              Solicitar Otro Turno
            </button>
          </div>
        ) : (
          /* FORMULARIO DE RESERVA */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ALERTA DE HORARIO NO DISPONIBLE */}
            {errorSimultaneo && (
              <div className="bg-red-50 border border-red-300 p-3 rounded-2xl text-xs text-red-700 font-extrabold flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>Horario no disponible. Por favor, intente con otro.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">DNI / Documento *</label>
                <input
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Sin puntos"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="WhatsApp"
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Deseada *</label>
              <input
                type="date"
                required
                value={fecha}
                min={minDate}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-bold"
              />
            </div>

            {/* GRILLA DE HORARIOS */}
            {fecha && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Horarios Disponibles:</label>
                {horariosDisponibles.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold py-2 text-center bg-red-50 rounded-xl border border-red-200">
                    No hay horarios disponibles para esta fecha.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {horariosDisponibles.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoraSeleccionada(h)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          horaSeleccionada === h
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {h} hs
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Motivo de Consulta</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Control General, Limpieza, Dolor"
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={cargando || !horaSeleccionada}
              className={`w-full font-extrabold text-xs py-3.5 px-4 rounded-xl transition-colors shadow-md mt-2 ${
                cargando || !horaSeleccionada
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {cargando ? 'Agendando Turno...' : 'Confirmar Turno Instantáneo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}