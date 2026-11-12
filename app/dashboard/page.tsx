'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProteccionRuta from '@/components/ProteccionRuta';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rol, setRol] = useState('Administrador');
  const [nombreUsuario, setNombreUsuario] = useState('Dirección Médica');

  useEffect(() => {
    const sesionRaw = localStorage.getItem('medent_sesion');
    if (sesionRaw) {
      try {
        const sesion = JSON.parse(sesionRaw);
        if (sesion.nombre) setNombreUsuario(sesion.nombre);
        if (sesion.rol === 'odontologo') setRol('Odontólogo');
        else if (sesion.rol === 'recepcion') setRol('Secretaría');
        else setRol('Administrador');
      } catch {
        // Mantiene valores por defecto
      }
    }
    setMounted(true);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('medent_sesion');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <ProteccionRuta rolesPermitidos={['admin']}>
      <div className="min-h-screen bg-slate-100 text-gray-800 flex flex-col justify-between">
        {/* HEADER NAVEGACIÓN DASHBOARD */}
        <header className="bg-blue-600 text-white p-4 shadow-md flex flex-col lg:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <Link href="/" className="flex flex-col hover:opacity-90 transition-opacity">
              <h1 className="text-xl font-black">MeDent</h1>
              <p className="text-[10px] uppercase font-bold text-blue-100">
                CLÍNICA ODONTOLÓGICA — PANEL PRINCIPAL
              </p>
            </Link>

            <div className="bg-blue-700/80 border border-blue-400/50 px-3 py-1 rounded-xl text-left">
              <span className="block text-[9px] uppercase font-black text-blue-200">
                🛡️ Sesión Activa
              </span>
              <span className="text-xs font-bold text-white">{nombreUsuario}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
            <Link
              href="/"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400"
            >
              🏠 Página Principal
            </Link>

            <Link
              href="/turnos"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400"
            >
              🗓️ Agenda
            </Link>

            <div className="flex items-center gap-1.5 bg-blue-700 px-2.5 py-1 rounded-xl border border-blue-500">
              <span className="text-xs font-bold text-blue-100">Vista:</span>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="bg-white text-blue-900 font-extrabold text-xs p-1 rounded-lg outline-none cursor-pointer"
              >
                <option value="Administrador">Administrador</option>
                <option value="Odontólogo">Odontólogo</option>
                <option value="Secretaría">Secretaría</option>
              </select>
            </div>

            <Link
              href="/configuracion"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400"
            >
              ⚙️ Permisos
            </Link>

            <button
              onClick={cerrarSesion}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm cursor-pointer"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </header>

        {/* CONTENIDO DASHBOARD */}
        <main className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 flex-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">Panel de Control General</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Visualizando módulos autorizados para el rol de <strong>{rol}</strong>.
              </p>
            </div>
            <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-xl uppercase">
              MODO {rol}
            </span>
          </div>

          {/* ACCIONES EXCLUSIVAS PARA ADMINISTRADOR */}
          {rol === 'Administrador' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-blue-900">
                👑 Acciones Administrativas Activas
              </span>
              <div className="flex flex-wrap gap-3">
                <Link href="/configuracion" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors">
                  Configuración General
                </Link>
                <Link href="/turnos" className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors">
                  Supervisar Agenda Global
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TARJETA 1: AGENDA */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🗓️</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                </div>
                <h3 className="text-base font-black text-gray-900">Agenda & Turnos</h3>
                <p className="text-xs text-gray-500">Grilla de turnos diaria, semanal y mensual.</p>
              </div>
              <Link href="/turnos" className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs py-2.5 px-4 rounded-xl transition-colors block">
                Ingresar al Módulo →
              </Link>
            </div>

            {/* TARJETA 2: PACIENTES */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">👥</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                </div>
                <h3 className="text-base font-black text-gray-900">Pacientes e Historias Clínicas</h3>
                <p className="text-xs text-gray-500">Fichas médicas, antecedentes y datos personales.</p>
              </div>
              <Link href="/pacientes" className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs py-2.5 px-4 rounded-xl transition-colors block">
                Ingresar al Módulo →
              </Link>
            </div>

            {/* TARJETA 3: ODONTOGRAMA */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🩺</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                </div>
                <h3 className="text-base font-black text-gray-900">Tratamientos & Odontograma</h3>
                <p className="text-xs text-gray-500">Prácticas odontológicas y ficha dental.</p>
              </div>
              <button onClick={() => alert('Módulo de Odontograma en desarrollo.')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer">
                Ingresar al Módulo →
              </button>
            </div>

            {/* TARJETA 4: FINANZAS (SOLO ADMINISTRADOR) */}
            {rol === 'Administrador' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">💰</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900">Finanzas & Aranceles</h3>
                  <p className="text-xs text-gray-500">Caja, facturación, honorarios y reportes de cobros.</p>
                </div>
                <button onClick={() => alert('Módulo de Finanzas en desarrollo.')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer">
                  Ingresar al Módulo →
                </button>
              </div>
            )}

            {/* TARJETA 5: RRHH (SOLO ADMINISTRADOR) */}
            {rol === 'Administrador' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">👨‍⚕️</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900">Recursos Humanos</h3>
                  <p className="text-xs text-gray-500">Legajos de personal, asistencias y pagos.</p>
                </div>
                <button onClick={() => alert('Módulo de Personal en desarrollo.')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer">
                  Ingresar al Módulo →
                </button>
              </div>
            )}

            {/* TARJETA 6: CONFIGURACIÓN (SOLO ADMINISTRADOR) */}
            {rol === 'Administrador' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">⚙️</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900">Configuración del Sistema</h3>
                  <p className="text-xs text-gray-500">Ajustes globales de clínica, marca, WhatsApp y CAT.</p>
                </div>
                <Link href="/configuracion" className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs py-2.5 px-4 rounded-xl transition-colors block">
                  Ingresar al Módulo →
                </Link>
              </div>
            )}
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-gray-400 border-t bg-white">
          MeDent SaaS Odontológico — Panel Principal de Control
        </footer>
      </div>
    </ProteccionRuta>
  );
}
{/* TARJETA 4: FINANZAS (SOLO ADMINISTRADOR) */}
            {rol === 'Administrador' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">💰</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">HABILITADO</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900">Finanzas & Aranceles</h3>
                  <p className="text-xs text-gray-500">Caja, facturación, honorarios y reportes de cobros.</p>
                </div>
                <Link href="/finanzas" className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs py-2.5 px-4 rounded-xl transition-colors block">
                  Ingresar al Módulo →
                </Link>
              </div>
            )}