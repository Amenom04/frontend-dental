'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import ProteccionRuta from '@/components/ProteccionRuta';

interface MovimientoCaja {
  id: number;
  fecha: string;
  tipo: 'Ingreso' | 'Egreso';
  paciente: string;
  practica: string;
  odontologo: string;
  medioPago: 'Efectivo' | 'Transferencia' | 'Tarjeta Débito/Crédito' | 'Obra Social';
  monto: number;
  porcentajeHonorario: number;
  observaciones?: string;
}

export default function FinanzasPage() {
  const { config, practicas, odontologos } = useConfig() as any;
  const [mounted, setMounted] = useState(false);

  // Listado de movimientos
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);

  // Filtros
  const [fechaFiltro, setFechaFiltro] = useState<string>('');
  const [profesionalFiltro, setProfesionalFiltro] = useState<string>('Todos');

  // Formulario de Nuevo Movimiento
  const [tipo, setTipo] = useState<'Ingreso' | 'Egreso'>('Ingreso');
  const [fechaMov, setFechaMov] = useState<string>('');
  const [paciente, setPaciente] = useState<string>('');
  const [practica, setPractica] = useState<string>('');
  const [odontologo, setOdontologo] = useState<string>('');
  const [medioPago, setMedioPago] = useState<MovimientoCaja['medioPago']>('Efectivo');
  const [monto, setMonto] = useState<string>('');
  const [porcentajeHonorario, setPorcentajeHonorario] = useState<string>('50');
  const [observaciones, setObservaciones] = useState<string>('');

  const listaPracticas: string[] =
    practicas && practicas.length > 0
      ? practicas.map((p: any) => (typeof p === 'string' ? p : p.nombre))
      : [
          'Consulta Odontológica',
          'Limpieza Dental / Profilaxis',
          'Arreglo / Obturación con Resina',
          'Endodoncia (Conducto)',
          'Extracción Simple / Cirugía',
          'Control de Ortodoncia',
          'Insumos / Gastos de Clínica'
        ];

  const listaOdontologos: string[] =
    odontologos && odontologos.length > 0
      ? odontologos.map((o: any) => (typeof o === 'string' ? o : o.nombre))
      : [
          'Od. Sofía Martínez',
          'Od. González',
          'Od. Graciela Quiroga',
          'Od. María González',
          'Clínica / Administración'
        ];

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaFiltro(hoy);
    setFechaMov(hoy);

    // Leer parámetros si viene desde "Cobrar Turno" en la Agenda
    const searchParams = new URLSearchParams(window.location.search);
    const paramPaciente = searchParams.get('paciente');
    const paramPractica = searchParams.get('practica');
    const paramOdontologo = searchParams.get('odontologo');

    if (paramPaciente) setPaciente(paramPaciente);
    setPractica(paramPractica || listaPracticas[0]);
    setOdontologo(paramOdontologo || listaOdontologos[0]);

    const guardados = localStorage.getItem('medent_finanzas');
    if (guardados) {
      setMovimientos(JSON.parse(guardados));
    }

    // Sincronizar con backend en Neon
    fetch('https://medent-backend.onrender.com/api/finanzas', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMovimientos(data);
          localStorage.setItem('medent_finanzas', JSON.stringify(data));
        }
      })
      .catch(() => null);

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegistrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return alert('Ingresa un monto válido mayor a 0.');
    }

    const nuevo: MovimientoCaja = {
      id: Date.now(),
      fecha: fechaMov,
      tipo,
      paciente: tipo === 'Ingreso' ? paciente.trim() || 'Paciente Particular' : 'Gasto Operativo',
      practica,
      odontologo: tipo === 'Ingreso' ? odontologo : 'Clínica / Administración',
      medioPago,
      monto: montoNum,
      porcentajeHonorario: tipo === 'Ingreso' ? Number(porcentajeHonorario) : 0,
      observaciones: observaciones.trim()
    };

    const actualizados = [nuevo, ...movimientos];
    setMovimientos(actualizados);
    localStorage.setItem('medent_finanzas', JSON.stringify(actualizados));

    await fetch('https://medent-backend.onrender.com/api/finanzas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    }).catch(() => null);

    setPaciente('');
    setMonto('');
    setObservaciones('');
  };

  const eliminarMovimiento = async (id: number) => {
    if (!confirm('¿Eliminar este registro de caja?')) return;
    const actualizados = movimientos.filter((m) => m.id !== id);
    setMovimientos(actualizados);
    localStorage.setItem('medent_finanzas', JSON.stringify(actualizados));

    await fetch(`https://medent-backend.onrender.com/api/finanzas/${id}`, {
      method: 'DELETE'
    }).catch(() => null);
  };

  // Filtrado de movimientos
  const movimientosFiltrados = movimientos.filter((m) => {
    const cumpleFecha = !fechaFiltro || m.fecha === fechaFiltro;
    const cumpleProf = profesionalFiltro === 'Todos' || m.odontologo === profesionalFiltro;
    return cumpleFecha && cumpleProf;
  });

  const exportarCSV = () => {
    if (movimientosFiltrados.length === 0) {
      return alert('No hay movimientos en la vista actual para exportar.');
    }

    const encabezados = [
      'Fecha',
      'Tipo',
      'Paciente',
      'Practica',
      'Odontologo',
      'Medio de Pago',
      'Monto Total',
      '% Honorario',
      'Honorario Odontologo',
      'Neto Clinica',
      'Observaciones'
    ];

    const filas = movimientosFiltrados.map((m) => {
      const honOd = m.tipo === 'Ingreso' ? (m.monto * m.porcentajeHonorario) / 100 : 0;
      const neto = m.tipo === 'Ingreso' ? m.monto - honOd : -m.monto;
      return [
        m.fecha,
        m.tipo,
        `"${(m.paciente || '').replace(/"/g, '""')}"`,
        `"${(m.practica || '').replace(/"/g, '""')}"`,
        `"${(m.odontologo || '').replace(/"/g, '""')}"`,
        `"${m.medioPago}"`,
        m.monto,
        m.porcentajeHonorario,
        honOd,
        neto,
        `"${(m.observaciones || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContenido = '\uFEFF' + [encabezados.join(';'), ...filas].join('\n');
    const blob = new Blob([csvContenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MeDent_Caja_${fechaFiltro || 'Historico'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  // Cálculos financieros
  const totalIngresos = movimientosFiltrados
    .filter((m) => m.tipo === 'Ingreso')
    .reduce((acc, m) => acc + m.monto, 0);

  const totalEgresos = movimientosFiltrados
    .filter((m) => m.tipo === 'Egreso')
    .reduce((acc, m) => acc + m.monto, 0);

  const totalHonorarios = movimientosFiltrados
    .filter((m) => m.tipo === 'Ingreso')
    .reduce((acc, m) => acc + (m.monto * m.porcentajeHonorario) / 100, 0);

  const netoClinica = totalIngresos - totalEgresos - totalHonorarios;

  const liquidacionPorProfesional = movimientosFiltrados
    .filter((m) => m.tipo === 'Ingreso')
    .reduce((acc: Record<string, { bruto: number; honorario: number; cantidad: number }>, m) => {
      if (!acc[m.odontologo]) {
        acc[m.odontologo] = { bruto: 0, honorario: 0, cantidad: 0 };
      }
      acc[m.odontologo].bruto += m.monto;
      acc[m.odontologo].honorario += (m.monto * m.porcentajeHonorario) / 100;
      acc[m.odontologo].cantidad += 1;
      return acc;
    }, {});

  const formatoMoneda = (valor: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor);

  const opcionesPracticas = practica && !listaPracticas.includes(practica)
    ? [practica, ...listaPracticas]
    : listaPracticas;

  const opcionesOdontologos = odontologo && !listaOdontologos.includes(odontologo)
    ? [odontologo, ...listaOdontologos]
    : listaOdontologos;

  return (
    <ProteccionRuta rolesPermitidos={['admin']}>
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between">
        {/* HEADER */}
        <header className="bg-blue-600 text-white p-4 shadow-md flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h1 className="text-xl font-black">{config?.nombreClinica || 'MeDent'} — Caja y Liquidación</h1>
            <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest">
              Control de Ingresos, Aranceles y Honorarios Profesionales
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/turnos"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400"
            >
              🗓️ Agenda
            </Link>
            <button
              onClick={exportarCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl border border-emerald-400 cursor-pointer"
            >
              📥 Exportar Excel (CSV)
            </button>
            <button
              onClick={() => window.print()}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs py-2 px-3 rounded-xl border border-indigo-400 cursor-pointer"
            >
              🖨️ Imprimir
            </button>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
          {/* TARJETAS DE RESUMEN FINANCIERO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-200">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Ingresos Totales</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{formatoMoneda(totalIngresos)}</p>
              <span className="text-[11px] text-slate-400 font-medium">Cobros registrados en filtro</span>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-purple-200">
              <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Honorarios Odontólogos</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{formatoMoneda(totalHonorarios)}</p>
              <span className="text-[11px] text-slate-400 font-medium">A liquidar a profesionales</span>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-red-200">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Egresos / Insumos</span>
              <p className="text-2xl font-black text-red-700 mt-1">{formatoMoneda(totalEgresos)}</p>
              <span className="text-[11px] text-slate-400 font-medium">Gastos operativos registrados</span>
            </div>

            <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-md">
              <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider">Neto Clínica</span>
              <p className="text-2xl font-black mt-1">{formatoMoneda(netoClinica)}</p>
              <span className="text-[11px] text-blue-100 font-medium">Ingresos - Honorarios - Gastos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMNA IZQUIERDA: FORMULARIO DE CARGA */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 h-fit">
              <h2 className="text-sm font-black text-slate-900 border-b pb-2 uppercase">
                ➕ Registrar Movimiento de Caja
              </h2>

              <form onSubmit={handleRegistrarMovimiento} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('Ingreso')}
                    className={`py-2.5 rounded-xl font-black border cursor-pointer transition-all ${
                      tipo === 'Ingreso'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    💵 Ingreso (Cobro)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('Egreso')}
                    className={`py-2.5 rounded-xl font-black border cursor-pointer transition-all ${
                      tipo === 'Egreso'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    💸 Egreso (Gasto)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      required
                      value={fechaMov}
                      onChange={(e) => setFechaMov(e.target.value)}
                      className="w-full font-bold border rounded-xl p-2.5 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Monto ($) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="Ej. 25000"
                      className="w-full font-black border border-blue-300 rounded-xl p-2.5 bg-blue-50/40 text-blue-950"
                    />
                  </div>
                </div>

                {tipo === 'Ingreso' && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                      <input
                        type="text"
                        required
                        value={paciente}
                        onChange={(e) => setPaciente(e.target.value)}
                        placeholder="Nombre y Apellido del Paciente"
                        className="w-full font-bold border rounded-xl p-2.5 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Odontólogo Tratante *</label>
                      <select
                        value={odontologo}
                        onChange={(e) => setOdontologo(e.target.value)}
                        className="w-full font-bold border rounded-xl p-2.5 bg-purple-50 text-purple-950"
                      >
                        {opcionesOdontologos.map((od, i) => (
                          <option key={i} value={od}>{od}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {tipo === 'Ingreso' ? 'Práctica / Tratamiento' : 'Concepto del Gasto'}
                  </label>
                  <select
                    value={practica}
                    onChange={(e) => setPractica(e.target.value)}
                    className="w-full font-bold border rounded-xl p-2.5 bg-slate-50"
                  >
                    {opcionesPracticas.map((p, i) => (
                      <option key={i} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medio de Pago</label>
                    <select
                      value={medioPago}
                      onChange={(e) => setMedioPago(e.target.value as any)}
                      className="w-full font-bold border rounded-xl p-2.5 bg-slate-50"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta Débito/Crédito">Tarjeta</option>
                      <option value="Obra Social">Obra Social</option>
                    </select>
                  </div>

                  {tipo === 'Ingreso' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">% Honorario Od.</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={porcentajeHonorario}
                        onChange={(e) => setPorcentajeHonorario(e.target.value)}
                        className="w-full font-bold border rounded-xl p-2.5 bg-slate-50"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observaciones (Opcional)</label>
                  <input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej. Coseguro OSDE / Seña tratamiento"
                    className="w-full border rounded-xl p-2.5 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  💾 Asentar en Caja
                </button>
              </form>
            </div>

            {/* COLUMNA DERECHA: FILTROS, LIQUIDACIÓN Y TABLA DE MOVIMIENTOS */}
            <div className="lg:col-span-2 space-y-6">
              {/* BARRA DE FILTROS */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end justify-between">
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">📅 Filtrar Fecha</label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                        className="text-xs font-bold border rounded-xl p-2 bg-slate-50"
                      />
                      {fechaFiltro && (
                        <button
                          type="button"
                          onClick={() => setFechaFiltro('')}
                          className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 px-2.5 rounded-xl cursor-pointer"
                        >
                          Ver Todo
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">👨‍⚕️ Profesional</label>
                    <select
                      value={profesionalFiltro}
                      onChange={(e) => setProfesionalFiltro(e.target.value)}
                      className="text-xs font-bold border rounded-xl p-2 bg-slate-50"
                    >
                      <option value="Todos">Todos los profesionales</option>
                      {listaOdontologos.map((od, i) => (
                        <option key={i} value={od}>{od}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <span className="text-xs font-black text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                  {movimientosFiltrados.length} Movimientos
                </span>
              </div>

              {/* LIQUIDACIÓN DE HONORARIOS POR ODONTÓLOGO */}
              {Object.keys(liquidacionPorProfesional).length > 0 && (
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-purple-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-950">
                    🩺 Resumen de Honorarios por Odontólogo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(liquidacionPorProfesional).map(([prof, datos]) => (
                      <div key={prof} className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-purple-950">{prof}</p>
                          <p className="text-[10px] font-bold text-slate-500">
                            {datos.cantidad} práctica(s) • Facturado: {formatoMoneda(datos.bruto)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase text-purple-600 block">Honorario</span>
                          <span className="text-sm font-black text-purple-900">{formatoMoneda(datos.honorario)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TABLA DETALLADA DE MOVIMIENTOS */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500">
                        <th className="p-3.5">Fecha</th>
                        <th className="p-3.5">Detalle / Paciente</th>
                        <th className="p-3.5">Odontólogo</th>
                        <th className="p-3.5">Medio</th>
                        <th className="p-3.5 text-right">Monto</th>
                        <th className="p-3.5 text-right">Hon. Od.</th>
                        <th className="p-3.5 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {movimientosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                            No hay movimientos registrados para este filtro.
                          </td>
                        </tr>
                      ) : (
                        movimientosFiltrados.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3.5 font-bold text-slate-600 whitespace-nowrap">{m.fecha}</td>
                            <td className="p-3.5">
                              <span className="font-black text-slate-900 block">{m.paciente}</span>
                              <span className="text-[11px] text-slate-500">{m.practica}</span>
                            </td>
                            <td className="p-3.5 font-bold text-purple-900">{m.odontologo}</td>
                            <td className="p-3.5">
                              <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg">
                                {m.medioPago}
                              </span>
                            </td>
                            <td className={`p-3.5 text-right font-black whitespace-nowrap ${m.tipo === 'Ingreso' ? 'text-emerald-700' : 'text-red-600'}`}>
                              {m.tipo === 'Ingreso' ? '+' : '-'} {formatoMoneda(m.monto)}
                            </td>
                            <td className="p-3.5 text-right font-bold text-purple-700 whitespace-nowrap">
                              {m.tipo === 'Ingreso' ? `${formatoMoneda((m.monto * m.porcentajeHonorario) / 100)} (${m.porcentajeHonorario}%)` : '-'}
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => eliminarMovimiento(m.id)}
                                className="text-red-500 hover:text-red-700 font-black text-xs px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
                                title="Eliminar registro"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProteccionRuta>
  );
}