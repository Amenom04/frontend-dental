'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Paciente {
  id: number;
  nombre: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  obra_social?: string;
  fecha_nacimiento?: string;
  antecedentes?: string;
}

export default function ListaPacientesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Modal Nuevo Paciente
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Formulario Nuevo Paciente
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellido, setNuevoApellido] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaObraSocial, setNuevaObraSocial] = useState('Particular');
  const [nuevaFechaNac, setNuevaFechaNac] = useState('');
  const [nuevosAntecedentes, setNuevosAntecedentes] = useState('');

  const cargarPacientes = () => {
    setCargando(true);
    fetch('https://medent-backend.onrender.com/api/pacientes')
      .then(async res => res.ok ? await res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setPacientes(data);
      })
      .catch(err => console.error('Error cargando pacientes:', err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    setMounted(true);
    cargarPacientes();
  }, []);

  const handleCrearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alert('Por favor, ingresa el nombre del paciente.');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch('https://medent-backend.onrender.com/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          apellido: nuevoApellido,
          dni: nuevoDni,
          telefono: nuevoTelefono,
          email: nuevoEmail,
          obra_social: nuevaObraSocial,
          fecha_nacimiento: nuevaFechaNac,
          antecedentes: nuevosAntecedentes
        })
      });

      if (res.ok) {
        alert('✅ Paciente registrado con éxito.');
        setMostrarModalNuevo(false);
        setNuevoNombre('');
        setNuevoApellido('');
        setNuevoDni('');
        setNuevoTelefono('');
        setNuevoEmail('');
        setNuevaObraSocial('Particular');
        setNuevaFechaNac('');
        setNuevosAntecedentes('');
        cargarPacientes();
      } else {
        alert('Ocurrió un problema al guardar el paciente.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  if (!mounted) return null;

  const pacientesFiltrados = pacientes.filter(p => {
    const term = busqueda.toLowerCase().trim();
    const nombreComp = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
    const dni = (p.dni || '').toLowerCase();
    const tel = (p.telefono || '').toLowerCase();
    return nombreComp.includes(term) || dni.includes(term) || tel.includes(term);
  });

  const getIniciales = (nombre: string, apellido?: string) => {
    const n = (nombre || '')[0] || 'P';
    const a = (apellido || '')[0] || '';
    return `${n}${a}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 flex flex-col justify-between">
      {/* HEADER SUPERIOR */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <Link href="/" className="flex flex-col hover:opacity-90 transition-opacity">
          <h1 className="text-xl font-black">MeDent</h1>
          <p className="text-[10px] uppercase font-bold text-blue-100">DIRECTORIO GENERAL DE PACIENTES</p>
        </Link>
        <div className="flex gap-2">
          <Link href="/dashboard" className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400">
            📊 Volver al Dashboard
          </Link>
          <Link href="/turnos" className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400">
            🗓️ Ir a la Agenda
          </Link>
          <Link href="/login" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm">
            🚪 Cerrar Sesión
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
        
        {/* ENCABEZADO Y BOTÓN NUEVO PACIENTE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-blue-950">Nómina de Pacientes Registrados</h2>
            <p className="text-xs text-gray-500 font-medium">Busca, registra o accede al odontograma e historia clínica de cada paciente.</p>
          </div>

          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-5 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>👤+</span> Registrar Nuevo Paciente
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar paciente por Nombre, Apellido o DNI..."
              className="w-full text-xs font-bold pl-9 pr-4 py-2.5 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <span className="text-xs font-black text-gray-400 bg-slate-100 px-3 py-2.5 rounded-2xl">
            Total: {pacientesFiltrados.length}
          </span>
        </div>

        {/* LISTADO DE TARJETAS DE PACIENTES */}
        {cargando ? (
          <div className="text-center py-12 text-sm font-bold text-blue-600 animate-pulse bg-white rounded-3xl border">
            Cargando nómina de pacientes...
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed space-y-3">
            <p className="text-sm font-bold text-gray-500">No se encontraron pacientes {busqueda && `para "${busqueda}"`}.</p>
            <button
              onClick={() => setMostrarModalNuevo(true)}
              className="text-xs font-black text-blue-600 hover:underline cursor-pointer"
            >
              + Agregar un nuevo paciente ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pacientesFiltrados.map(p => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-900 font-black rounded-2xl flex items-center justify-center text-base shadow-inner">
                    {getIniciales(p.nombre, p.apellido)}
                  </div>
                  <div className="truncate flex-1">
                    <h3 className="text-sm font-black text-gray-900 truncate">
                      {p.nombre} {p.apellido}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-bold">DNI: {p.dni || 'Sin Documento'}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold text-[10px]">Teléfono:</span>
                    <span className="font-bold text-emerald-700">{p.telefono || 'Sin datos'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold text-[10px]">Obra Social:</span>
                    <span className="font-bold text-gray-800">{p.obra_social || 'Particular'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => router.push(`/pacientes?buscar=${encodeURIComponent(p.nombre)}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-sm transition-colors cursor-pointer text-center"
                  >
                    🦷 Abrir Odontograma
                  </button>
                  <button
                    onClick={() => router.push(`/turnos?paciente=${encodeURIComponent(p.nombre)}`)}
                    className="bg-slate-100 hover:bg-slate-200 text-gray-700 font-extrabold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    🗓️ Turno
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* MODAL NUEVO PACIENTE */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-blue-900">👤 Registrar Nuevo Paciente</h3>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-gray-400 hover:text-gray-600 font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearPaciente} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    required
                    placeholder="Ej. Carlos"
                    className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={nuevoApellido}
                    onChange={(e) => setNuevoApellido(e.target.value)}
                    placeholder="Ej. Gómez"
                    className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">DNI / Pasaporte</label>
                  <input
                    type="text"
                    value={nuevoDni}
                    onChange={(e) => setNuevoDni(e.target.value)}
                    placeholder="Ej. 34123456"
                    className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="+54 9 351 123456"
                    className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Obra Social / Prepaga</label>
                  <input
                    type="text"
                    value={nuevaObraSocial}
                    onChange={(e) => setNuevaObraSocial(e.target.value)}
                    placeholder="Particular, OSDE, etc."
                    className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={nuevaFechaNac}
                    onChange={(e) => setNuevaFechaNac(e.target.value)}
                    className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Antecedentes Alérgicos / Médicos</label>
                <input
                  type="text"
                  value={nuevosAntecedentes}
                  onChange={(e) => setNuevosAntecedentes(e.target.value)}
                  placeholder="Ej. Alérgico a la Penicilina, Hipertensión"
                  className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow cursor-pointer transition-colors"
                >
                  {guardando ? 'Guardando...' : 'Guardar Paciente'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="py-4 text-center text-xs text-gray-400 border-t bg-white">
        MeDent SaaS Odontológico — Módulo Directoria de Pacientes
      </footer>
    </div>
  );
}