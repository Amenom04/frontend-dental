'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type RolStaff = 'Administrador' | 'Contador' | 'Recursos Humanos' | 'Odontologo' | 'Supervisor' | 'Secretaria';

interface ModuloPermiso {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
}

const MODULOS_SISTEMA: ModuloPermiso[] = [
  { id: 'agenda', nombre: 'Agenda & Turnos', descripcion: 'Grilla de turnos diaria, semanal y mensual', icono: '🗓️', ruta: '/turnos' },
  { id: 'pacientes', nombre: 'Pacientes e Historias Clínicas', descripcion: 'Fichas médicas, antecedentes y datos personales', icono: '📑', ruta: '/pacientes' },
  { id: 'tratamientos', nombre: 'Tratamientos & Odontograma', descripcion: 'Prácticas odontológicas y ficha dental', icono: '🩺', ruta: '/pacientes' },
  { id: 'finanzas', nombre: 'Finanzas & Aranceles', descripcion: 'Caja, facturación, honorarios y reportes de cobros', icono: '💰', ruta: '/dashboard' },
  { id: 'rrhh', nombre: 'Recursos Humanos', descripcion: 'Legajos de personal, asistencias y pagos', icono: '👥', ruta: '/dashboard' },
  { id: 'configuracion', nombre: 'Configuración del Sistema', descripcion: 'Ajustes globales de clínica y usuarios', icono: '⚙️', ruta: '/dashboard' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [rolActivo, setRolActivo] = useState<RolStaff>('Administrador');
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [rolAConfigurar, setRolAConfigurar] = useState<RolStaff>('Administrador');

  const [permisos, setPermisos] = useState<Record<RolStaff, Record<string, boolean>>>({
    Administrador: { agenda: true, pacientes: true, tratamientos: true, finanzas: true, rrhh: true, configuracion: true },
    Contador: { agenda: false, pacientes: false, tratamientos: false, finanzas: true, rrhh: true, configuracion: false },
    'Recursos Humanos': { agenda: false, pacientes: false, tratamientos: false, finanzas: false, rrhh: true, configuracion: false },
    Odontologo: { agenda: true, pacientes: true, tratamientos: true, finanzas: false, rrhh: false, configuracion: false },
    Supervisor: { agenda: true, pacientes: true, tratamientos: true, finanzas: true, rrhh: true, configuracion: false },
    Secretaria: { agenda: true, pacientes: true, tratamientos: false, finanzas: true, rrhh: false, configuracion: false },
  });

  useEffect(() => {
    const guardados = localStorage.getItem('medent_permisos_staff');
    if (guardados) {
      try { setPermisos(JSON.parse(guardados)); } catch (e) { console.error(e); }
    }
  }, []);

  const togglePermiso = (rol: RolStaff, moduloId: string) => {
    const nuevos = {
      ...permisos,
      [rol]: {
        ...permisos[rol],
        [moduloId]: !permisos[rol][moduloId]
      }
    };
    setPermisos(nuevos);
    localStorage.setItem('medent_permisos_staff', JSON.stringify(nuevos));
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  const ROLES_LISTA: RolStaff[] = [
    'Administrador',
    'Contador',
    'Recursos Humanos',
    'Odontologo',
    'Supervisor',
    'Secretaria'
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col">
      {/* CABECERA CON LOGO Y BOTÓN DE CERRAR SESIÓN */}
      <header className="bg-blue-600 text-white py-4 px-8 shadow-md flex justify-between items-center">
        {/* LOGO REDIRECCIÓN A LANDING PRINCIPAL */}
        <Link href="/" className="group cursor-pointer">
          <h1 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-100 transition-colors">
            MeDent
          </h1>
          <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">
            Clínica Odontológica — Panel Principal
          </p>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/turnos" className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-xl text-xs border border-blue-500 transition-colors">
            🗓️ Ir a la Agenda
          </Link>

          {/* SELECTOR DE ROL Y MODO EN TIEMPO REAL */}
          <div className="flex items-center gap-2 bg-blue-700 px-3 py-1.5 rounded-xl border border-blue-500">
            <span className="text-xs font-extrabold text-blue-100">Modo:</span>
            <select
              value={rolActivo}
              onChange={(e) => setRolActivo(e.target.value as RolStaff)}
              className="bg-white text-blue-900 font-extrabold text-xs py-1 px-2 rounded-lg outline-none cursor-pointer"
            >
              {ROLES_LISTA.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              setRolAConfigurar(rolActivo);
              setModalConfigOpen(true);
            }}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-500 transition-colors"
          >
            ⚙️ Permisos de Accesos
          </button>

          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleCerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DEL DASHBOARD */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-gray-800">Panel de Control General</h2>
              <span className="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase border border-blue-200">
                Modo {rolActivo}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Visualizando módulos autorizados para el rol de <strong className="text-gray-700">{rolActivo}</strong>.
            </p>
          </div>
        </div>

        {/* GRILLA DE MÓDULOS CON VISIBILIDAD DINÁMICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULOS_SISTEMA.map((modulo) => {
            const tieneAcceso = permisos[rolActivo]?.[modulo.id];

            return (
              <div 
                key={modulo.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  tieneAcceso 
                    ? 'bg-white shadow-sm border-gray-200 hover:border-blue-400 hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 opacity-40 grayscale'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">{modulo.icono}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                      tieneAcceso ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {tieneAcceso ? 'Habilitado' : 'Sin Acceso'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-gray-800">{modulo.nombre}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{modulo.descripcion}</p>
                </div>

                {tieneAcceso ? (
                  <Link 
                    href={modulo.ruta}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-colors text-center block shadow-2xs"
                  >
                    Ingresar al Módulo →
                  </Link>
                ) : (
                  <button 
                    disabled 
                    className="w-full bg-gray-200 text-gray-500 font-bold text-xs py-2.5 rounded-xl text-center cursor-not-allowed"
                  >
                    🔒 Bloqueado para {rolActivo}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL CONFIGURACIÓN DE PERMISOS */}
      {modalConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-800">⚙️ Configuración de Permisos por Rol</h3>
                <p className="text-xs text-gray-500 font-medium">Activa o desactiva módulos para cada modo.</p>
              </div>
              <button onClick={() => setModalConfigOpen(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Seleccionar Rol a Configurar:</label>
              <select
                value={rolAConfigurar}
                onChange={(e) => setRolAConfigurar(e.target.value as RolStaff)}
                className="w-full text-xs font-bold border border-gray-300 rounded-xl p-3 bg-gray-50 text-blue-900 outline-none"
              >
                {ROLES_LISTA.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {MODULOS_SISTEMA.map((mod) => {
                const activo = permisos[rolAConfigurar]?.[mod.id] || false;
                return (
                  <div 
                    key={mod.id}
                    onClick={() => togglePermiso(rolAConfigurar, mod.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      activo ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-800">{mod.icono} {mod.nombre}</span>
                    <input type="checkbox" checked={activo} onChange={() => {}} className="w-4 h-4 text-blue-600 cursor-pointer" />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setModalConfigOpen(false)}
                className="px-6 py-2.5 text-xs font-extrabold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}