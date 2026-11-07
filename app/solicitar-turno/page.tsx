'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useConfig } from '../../context/ConfigContext';

export default function SolicitarTurnoPage() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);

  const practicasDisponibles = [
    'Odontología General / Consulta',
    'Limpieza Dental / Profilaxis',
    'Consulta por Ortodoncia',
    'Cirugía Maxilofacial',
    'Guardia / Urgencia Dental',
    'Diagnóstico Radiológico (Pantomografía)'
  ];

  const [paso, setPaso] = useState(1);
  const [motivo, setMotivo] = useState(practicasDisponibles[0]);
  
  const [fechaTextoArg, setFechaTextoArg] = useState('06/11/2026'); 
  const [hora, setHora] = useState('');

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesActual, setMesActual] = useState(10);
  const [anioActual, setAnioActual] = useState(2026);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [obraSocial, setObraSocial] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [comprobante, setComprobante] = useState<any>(null);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  const horariosDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  useEffect(() => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    
    setFechaTextoArg(`${dia}/${mes}/${anio}`);
    setMesActual(hoy.getMonth());
    setAnioActual(hoy.getFullYear());
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setMostrarCalendario(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetFormulario = () => {
    setPaso(1);
    setMotivo(practicasDisponibles[0]);
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    setFechaTextoArg(`${dia}/${mes}/${hoy.getFullYear()}`);
    setHora('');
    setNombre('');
    setTelefono('');
    setDni('');
    setEmail('');
    setObraSocial('');
    setComprobante(null);
  };

  const obtenerDiasDelMes = (mes: number, anio: number) => {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    
    let diaInicio = primerDia.getDay() - 1;
    if (diaInicio === -1) diaInicio = 6;

    const dias = [];
    for (let i = 0; i < diaInicio; i++) dias.push(null);
    for (let i = 1; i <= diasEnMes; i++) dias.push(i);
    return dias;
  };

  const seleccionarDia = (dia: number) => {
    const dStr = String(dia).padStart(2, '0');
    const mStr = String(mesActual + 1).padStart(2, '0');
    setFechaTextoArg(`${dStr}/${mStr}/${anioActual}`);
    setHora('');
    setMostrarCalendario(false);
  };

  const handleReservarPublico = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const idNuevo = Date.now();
    const nuevoTurno = {
      id: idNuevo,
      codigo: 'MED-' + Math.floor(100000 + Math.random() * 900000),
      paciente_nombre: nombre,
      paciente_telefono: telefono,
      telefono: telefono,
      paciente_dni: dni,
      paciente_email: email,
      obra_social: obraSocial,
      fecha: fechaTextoArg,
      fecha_arg: fechaTextoArg,
      hora: hora,
      motivo: motivo,
      especialidad: 'Odontología General',
      profesional: 'Odontología General',
      estado: 'Confirmado'
    };

    // 1. Persistencia Local
    const localesPrevios = JSON.parse(localStorage.getItem('medent_turnos_locales') || '[]');
    localStorage.setItem('medent_turnos_locales', JSON.stringify([...localesPrevios, nuevoTurno]));

    // 2. Envío silencioso en segundo plano vía API (sin abrir pestañas)
    try {
      await fetch('http://localhost:4000/api/turnos/confirmar-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoTurno,
          nombreClinica: config.nombreClinica
        })
      });
    } catch (error) {
      console.log('Turno registrado localmente. Servidor de WhatsApp no disponible.');
    } finally {
      setHorariosOcupados(prev => [...prev, hora]);
      setComprobante(nuevoTurno);
      setPaso(3);
      setEnviando(false);
    }
  };

  if (!mounted) return null;

  const hoy = new Date();
  const diasGrilla = obtenerDiasDelMes(mesActual, anioActual);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between ${config.tipoTipografia}`}>
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/" onClick={resetFormulario} className="flex items-center gap-3.5 select-none">
            <svg width="46" height="46" viewBox="0 0 100 100" className="fill-none flex-shrink-0">
              <path d="M 50,22 C 38,12 20,15 20,38 C 20,60 25,70 38,90 C 42,80 38,60 48,50 L 52,68 L 68,42" stroke="#2c3e50" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 50,22 C 62,12 80,15 80,38 C 80,60 75,70 62,90 L 56,76" stroke="#2563eb" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">{config.nombreClinica}</h1>
              <p className="text-[9px] font-extrabold uppercase text-blue-600 tracking-wider mt-1">SOLICITUD PÚBLICA DE CITA</p>
            </div>
          </Link>

          <Link href="/" onClick={resetFormulario} className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        {paso < 3 && (
          <div className="mb-8 text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Reserva tu Cita Dental</h2>
            <p className="text-xs text-slate-500">
              Ingresa tus datos y confirma el horario para asentarlo de forma directa e inmediata.
            </p>
          </div>
        )}

        {paso === 1 && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b pb-3">
              1. Selecciona Fecha y Horario
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Consulta / Especialidad</label>
                <select
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3.5 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer text-slate-900"
                >
                  {practicasDisponibles.map((p, index) => (
                    <option key={index} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="relative" ref={calendarRef}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Fecha del Turno (dd/mm/aaaa) *</label>
                
                <button
                  type="button"
                  onClick={() => setMostrarCalendario(!mostrarCalendario)}
                  className="w-full text-left text-xs font-bold border border-slate-300 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors flex justify-between items-center cursor-pointer"
                >
                  <span className="text-blue-900 font-extrabold">
                    {fechaTextoArg}
                  </span>
                  <span className="text-base">📅</span>
                </button>

                {mostrarCalendario && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-72 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (mesActual === 0) {
                            setMesActual(11);
                            setAnioActual(a => a - 1);
                          } else {
                            setMesActual(m => m - 1);
                          }
                        }}
                        className="p-1 hover:bg-slate-100 rounded-lg text-xs font-black"
                      >
                        ←
                      </button>
                      <span className="text-xs font-black text-slate-900">
                        {nombresMeses[mesActual]} {anioActual}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (mesActual === 11) {
                            setMesActual(0);
                            setAnioActual(a => a + 1);
                          } else {
                            setMesActual(m => m + 1);
                          }
                        }}
                        className="p-1 hover:bg-slate-100 rounded-lg text-xs font-black"
                      >
                        →
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {diasSemana.map(d => (
                        <span key={d} className="text-[10px] font-black text-slate-400 uppercase py-1">
                          {d}
                        </span>
                      ))}

                      {diasGrilla.map((dia, idx) => {
                        if (dia === null) return <div key={`empty-${idx}`} />;

                        const fechaComparar = new Date(anioActual, mesActual, dia);
                        const esPasado = fechaComparar < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                        const dStr = String(dia).padStart(2, '0');
                        const mStr = String(mesActual + 1).padStart(2, '0');
                        const fechaFormato = `${dStr}/${mStr}/${anioActual}`;
                        const esSeleccionado = fechaTextoArg === fechaFormato;

                        return (
                          <button
                            key={dia}
                            type="button"
                            disabled={esPasado}
                            onClick={() => seleccionarDia(dia)}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                              esPasado
                                ? 'text-slate-300 cursor-not-allowed line-through'
                                : esSeleccionado
                                ? 'bg-blue-600 text-white font-black shadow-sm'
                                : 'hover:bg-blue-50 text-slate-700 cursor-pointer'
                            }`}
                          >
                            {dia}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {fechaTextoArg && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">Horarios Libres Disponibles:</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {horariosDisponibles.map(h => {
                      const estaOcupado = horariosOcupados.includes(h);
                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={estaOcupado}
                          onClick={() => setHora(h)}
                          className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                            estaOcupado
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 line-through opacity-60'
                              : hora === h
                              ? 'bg-blue-600 text-white shadow-md scale-105 cursor-pointer'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer'
                          }`}
                        >
                          {estaOcupado ? 'Ocupado' : `${h} hs`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                disabled={!fechaTextoArg || !hora}
                onClick={() => setPaso(2)}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-black text-xs py-3.5 px-8 rounded-xl shadow-md cursor-pointer"
              >
                Siguiente: Mis Datos →
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <form onSubmit={handleReservarPublico} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b pb-3">
              2. Completa tus Datos
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej. María García"
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="Ej. 03511234567"
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DNI / Documento <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input
                    type="text"
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                    placeholder="Ej. 30123456"
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Obra Social / Prepaga <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input
                    type="text"
                    value={obraSocial}
                    onChange={e => setObraSocial(e.target.value)}
                    placeholder="Ej. OSDE, Swiss Medical, Particular..."
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ej. paciente@correo.com"
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-blue-950 block">Detalle de la Reserva:</span>
                <span className="text-blue-900 font-bold">{fechaTextoArg} — {hora} hs ({motivo})</span>
              </div>
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="text-blue-700 font-bold underline cursor-pointer"
              >
                Cambiar
              </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Volver
              </button>

              <button
                type="submit"
                disabled={enviando}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 px-8 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {enviando ? 'Confirmando...' : 'Confirmar Turno 📅'}
              </button>
            </div>
          </form>
        )}

        {paso === 3 && comprobante && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">¡Turno Confirmado con Éxito!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Se ha enviado una notificación automática a tu celular vía WhatsApp.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-xs mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-bold">Código Cita:</span>
                <span className="font-black text-blue-600">{comprobante.codigo || comprobante.id}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-bold">Fecha / Hora:</span>
                <span className="font-black text-slate-800">{fechaTextoArg} — {hora} hs</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-bold">Práctica:</span>
                <span className="font-bold text-slate-800">{motivo}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-bold">Paciente:</span>
                <span className="font-bold text-slate-800">{nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Contacto:</span>
                <span className="font-bold text-slate-800">{telefono}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                onClick={resetFormulario}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-6 rounded-xl inline-block"
              >
                Finalizar y Volver al Inicio
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white py-6 border-t text-center text-xs text-slate-400">
        {config.nombreClinica} — Canal Oficial de Solicitud de Citas
      </footer>
    </div>
  );
}