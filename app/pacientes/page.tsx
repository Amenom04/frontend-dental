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
}

export default function DirectivoPacientesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  
  // Control de rol (por defecto Administrador)
  const [rol, setRol] = useState('Administrador');

  // Formulario Nuevo Paciente
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [obraSocial, setObraSocial] = useState('Particular');
  const [guardando, setGuardando] = useState(false);

  const cargarPacientes = () => {
    setCargando(true);
    fetch('https://medent-backend.onrender.com/api/pacientes')
      .then(async res => (res.ok ? await res.json() : []))
      .then((data: Paciente[]) => {
        if (Array.isArray(data)) setPacientes(data);
      })
      .catch(err => console.error('Error cargando pacientes:', err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    setMounted(true);
    cargarPacientes();
  }, []);

  const handleGuardarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('El nombre es obligatorio.');

    setGuardando(true);
    try {
      const res = await fetch('https://medent-backend.onrender.com/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          dni,
          telefono,
          email,
          obra_social: obraSocial
        })
      });

      if (res.ok) {
        alert('✅ Paciente guardado con éxito.');
        setNombre('');
        setApellido('');
        setDni('');
        setTelefono('');
        setEmail('');
        setObraSocial('Particular');
        cargarPacientes();
      } else {
        alert('Ocurrió un error al guardar.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // Función de eliminación segura tipada para evitar errores en Vercel
  const handleEliminarPaciente = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este paciente?')) return;

    try {
      const res = await fetch(`https://medent-backend.onrender.com/api/pacientes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('🗑️ Paciente eliminado correctamente.');
        cargarPacientes();
      } else {
        setPacientes((prev: Paciente[]) => prev.filter((p: Paciente) => p.id !== id));
        alert('🗑️ Paciente removido de la vista activa.');
      }
    } catch (err) {
      setPacientes((prev: Paciente[]) => prev.filter((p: Paciente) => p.id !== id));
      alert('🗑️ Paciente removido de la vista activa.');
    }
  };

  if (!mounted) return null;

  const pacientesFiltrados = pacientes.filter(p => {
    const term = busqueda.toLowerCase().trim();
    const nombreComp = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
    const doc = (p.dni || '').toLowerCase();
    return nombreComp.includes(term) || doc.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 flex flex-col justify-between">
      {/* HEADER SUPERIOR */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <Link href="/" className="flex flex-col hover:opacity-90">
          <h1 className="text-xl font-black">MeDent</h1>
          <p className="text-[10px] uppercase font-bold text-blue-100">CLÍNICA ODONTOLÓGICA — FICHAS & HISTORIAS CLÍNICAS</p>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-blue-700 px-2.5 py-1 rounded-xl border border-blue-500 mr-2">
            <span className="text-xs font-bold text-blue-100">Modo:</span>
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
      <main className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4 h-fit">
          <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider border-b pb-3">
            REGISTRAR NUEVO PACIENTE
          </h3>

          <form onSubmit={handleGuardarPaciente} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                placeholder="Ej. Juan"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                placeholder="Ej. Pérez"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">DNI / Documento</label>
              <input
                type="text"
                value={dni}
                onChange={e => setDni(e.target.value)}
                placeholder="Ej. 12345678"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="Ej. +54 9 351 1234567"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 font-bold text-emerald-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="paciente@email.com"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Obra Social / Prepaga</label>
              <input
                type="text"
                value={obraSocial}
                onChange={e => setObraSocial(e.target.value)}
                placeholder="Particular, OSDE, etc."
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-sm transition-colors cursor-pointer mt-2"
            >
              {guardando ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: TABLA DE PACIENTES */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
            <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider">
              {pacientesFiltrados.length} de {pacientes.length} Registrados
            </h3>
            
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar por Nombre, Apellido o DNI..."
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {cargando ? (
            <div className="text-center py-12 text-xs font-bold text-blue-600 animate-pulse">
              Cargando nómina de pacientes...
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 bg-slate-50 rounded-2xl border border-dashed">
              No se encontraron pacientes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase border-b">
                    <th className="p-3">PACIENTE</th>
                    <th className="p-3">DNI</th>
                    <th className="p-3">WHATSAPP</th>
                    <th className="p-3">OBRA SOCIAL</th>
                    <th className="p-3 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {pacientesFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-black text-gray-900">
                        {p.nombre} {p.apellido || ''}
                      </td>
                      <td className="p-3 font-bold text-gray-600">
                        {p.dni || '-'}
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        {p.telefono || '-'}
                      </td>
                      <td className="p-3 text-gray-700">
                        {p.obra_social || 'Particular'}
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/pacientes/ficha?id=${p.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          Ver Historia Clínica
                        </button>

                        {/* Botón eliminar exclusivo para Administrador */}
                        {rol === 'Administrador' && (
                          <button
                            onClick={() => handleEliminarPaciente(p.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <footer className="py-4 text-center text-xs text-gray-400 border-t bg-white">
        MeDent SaaS Odontológico — Sistema de Protección y Custodia de Pacientes
      </footer>
    </div>
  );
}