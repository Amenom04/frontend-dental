'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Turno {
  fecha: string;
  hora: string;
  estado: string;
}

const BLOQUES_HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

export default function SolicitarTurnoPacientePage() {
  const NUMERO_WHATSAPP = '5493510000000'; // Reemplazar por el número de la clínica

  const [fecha, setFecha] = useState('');
  const [fechaMinima, setFechaMinima] = useState('');
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [motivo, setMotivo] = useState('Consulta General');
  
  const [turnosOcupados, setTurnosOcupados] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(false);
  const [turnoReservado, setTurnoReservado] = useState<any>(null);

  useEffect(() => {
    const hoyStr = new Date().toISOString().split('T')[0];
    setFecha(hoyStr);
    setFechaMinima(hoyStr);
  }, []);

  // Cargar disponibilidad sin revelar datos de otros pacientes
  useEffect(() => {
    if (!fecha) return;
    fetch(`http://localhost:4000/api/turnos?fecha=${fecha}`)
      .then(res => res.json())
      .then(data => setTurnosOcupados(data))
      .catch(console.error);
  }, [fecha]);

  const coincideFecha = (f1: string, f2: string) => f1.split('T')[0] === f2.split('T')[0];

  const handleSolicitarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !dni || !telefono || !fecha || !hora) {
      return alert('Por favor completa todos los campos requeridos');
    }

    setCargando(true);
    try {
      // 1. Buscar si el paciente existe o registrarlo automáticamente
      let pacienteId: number;
      const resPacientes = await fetch('http://localhost:4000/api/pacientes');
      const pacientesList = await resPacientes.json();
      const pacienteExistente = pacientesList.find((p: any) => p.dni === dni);

      if (pacienteExistente) {
        pacienteId = pacienteExistente.id;
      } else {
        const resNuevoPac = await fetch('http://localhost:4000/api/pacientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, apellido, dni, telefono })
        });
        const nuevoPac = await resNuevoPac.json();
        pacienteId = nuevoPac.id;
      }

      // 2. Insertar el turno en la agenda interna
      const resTurno = await fetch('http://localhost:4000/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          fecha,
          hora,
          motivo,
          profesional: 'Dr. Alejandro Rossi',
          duracion_minutos: 30,
          notas: 'Reserva Online por Web'
        })
      });

      const dataTurno = await resTurno.json();

      if (!resTurno.ok) {
        alert(`⚠️ ${dataTurno.error || 'Turno no disponible'}`);
        return;
      }

      setTurnoReservado({
        fecha,
        hora,
        paciente: `${nombre} ${apellido}`,
        dni
      });

    } catch (error) {
      console.error('Error al solicitar turno:', error);
      alert('Error de conexión al procesar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  const mensajeWhatsApp = turnoReservado
    ? encodeURIComponent(
        `Hola MeDent! Solicité un turno online:\n\n` +
        `👤 Paciente: ${turnoReservado.paciente}\n` +
        `🪪 DNI: ${turnoReservado.dni}\n` +
        `📅 Fecha: ${turnoReservado.fecha.split('-').reverse().join('/')}\n` +
        `⏰ Hora: ${turnoReservado.hora} hs\n\n` +
        `¿Podrían confirmarme la recepción del turno? Gracias!`
      )
    : '';

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      <header className="bg-blue-600 text-white py-5 px-8 shadow-md flex justify-between items-center">
        <Link href="/" className="group">
          <h1 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-100 transition-colors">
            MeDent
          </h1>
          <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">
            Clínica Odontológica
          </p>
        </Link>
        <Link href="/" className="text-xs font-bold bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl transition-colors">
          ← Volver al Inicio
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
        
        {turnoReservado ? (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-200 text-center space-y-5">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto font-black">
              ✓
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-800">¡Turno Solicitado con Éxito!</h2>
              <p className="text-xs font-semibold text-gray-500">
                Tu cita ha sido registrada en nuestro sistema de agenda.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 text-left space-y-2 text-xs">
              <p className="flex justify-between border-b pb-1.5">
                <span className="text-gray-500 font-bold">Paciente:</span>
                <span className="font-extrabold text-blue-900">{turnoReservado.paciente}</span>
              </p>
              <p className="flex justify-between border-b pb-1.5">
                <span className="text-gray-500 font-bold">Fecha:</span>
                <span className="font-bold">{turnoReservado.fecha.split('-').reverse().join('/')}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500 font-bold">Horario:</span>
                <span className="font-extrabold text-blue-700">{turnoReservado.hora} hs</span>
              </p>
            </div>

            <div className="pt-3 space-y-3">
              <a 
                href={`https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm py-3 px-6 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                💬 Confirmar Turno por WhatsApp
              </a>

              <button 
                onClick={() => setTurnoReservado(null)}
                className="text-xs font-bold text-gray-500 hover:underline"
              >
                Reservar otro turno
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSolicitarTurno} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-black text-gray-800">🗓️ Reserva tu Turno Odontológico</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Selecciona la fecha, el horario disponible e ingresa tus datos.
              </p>
            </div>

            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Atención *</label>
                <input 
                  type="date"
                  value={fecha}
                  min={fechaMinima}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHora('');
                  }}
                  required
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Horario Disponible *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {BLOQUES_HORARIOS.map((h) => {
                    const ocupado = turnosOcupados.some(t => coincideFecha(t.fecha, fecha) && t.hora.substring(0, 5) === h && t.estado !== 'Cancelado');
                    const seleccionado = hora === h;

                    return (
                      <button
                        type="button"
                        key={h}
                        disabled={ocupado}
                        onClick={() => setHora(h)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          ocupado 
                            ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed line-through' 
                            : seleccionado
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                        }`}
                      >
                        {h} hs
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre *</label>
                  <input 
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ej: Juan"
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Apellido *</label>
                  <input 
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    placeholder="Ej: Pérez"
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">DNI / Documento *</label>
                  <input 
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    placeholder="Ej: 35123456"
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp *</label>
                  <input 
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    placeholder="Ej: 3511234567"
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo de la Consulta</label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Consulta General">Consulta General / Diagnóstico</option>
                  <option value="Limpieza Dental">Limpieza Dental / Ortodoncia</option>
                  <option value="Urgencia / Dolor">Urgencia / Dolor</option>
                  <option value="Extracción">Extracción / Cirugía</option>
                  <option value="Blanqueamiento">Blanqueamiento Estético</option>
                </select>
              </div>

            </div>

            <button 
              type="submit"
              disabled={cargando || !hora}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold text-sm py-3 rounded-2xl transition-colors shadow-sm"
            >
              {cargando ? 'Procesando Reserva...' : 'Confirmar Reserva de Turno'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}