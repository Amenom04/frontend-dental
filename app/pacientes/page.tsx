'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type RolStaff = 'Administrador' | 'Contador' | 'Recursos Humanos' | 'Odontologo' | 'Supervisor' | 'Secretaria';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  obra_social: string;
}

export default function PacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rolActivo, setRolActivo] = useState<RolStaff>('Administrador');
  const [busqueda, setBusqueda] = useState('');

  // Formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [obraSocial, setObraSocial] = useState('');

  const ROLES_LISTA: RolStaff[] = [
    'Administrador',
    'Contador',
    'Recursos Humanos',
    'Odontologo',
    'Supervisor',
    'Secretaria'
  ];

  const cargarPacientes = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/pacientes');
      if (res.ok) {
        const data = await res.json();
        setPacientes(data);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const handleCrearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !dni) return alert('Nombre, Apellido y DNI son obligatorios.');

    try {
      const res = await fetch('http://localhost:4000/api/pacientes', {
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
        setNombre('');
        setApellido('');
        setDni('');
        setTelefono('');
        setEmail('');
        setObraSocial('');
        await cargarPacientes();
      }
    } catch (error) {
      console.error('Error al crear paciente:', error);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const query = busqueda.toLowerCase().trim();
    if (!query) return true;
    return (
      p.nombre?.toLowerCase().includes(query) ||
      p.apellido?.toLowerCase().includes(query) ||
      p.dni?.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col">
      {/* CABECERA UNIFICADA DE NAVEGACIÓN */}
      <header className="bg-blue-600 text-white py-4 px-8 shadow-md flex justify-between items-center">
        {/* LOGO ENLAZADO A LA PÁGINA PRINCIPAL */}
        <Link href="/" className="group cursor-pointer">
          <h1 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-100 transition-colors">
            MeDent
          </h1>
          <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">
            Clínica Odontológica — Fichas & Historias Clínicas
          </p>
        </Link>

        <div className="flex items-center gap-3">
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

          <Link 
            href="/turnos" 
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-xl text-xs border border-blue-500 transition-colors flex items-center gap-1.5"
          >
            🗓️ Ir a la Agenda
          </Link>

          <Link 
            href="/dashboard" 
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-xl text-xs border border-blue-500 transition-colors"
          >
            ← Volver al Dashboard
          </Link>

          <button
            onClick={handleCerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DE PACIENTES */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario Registro */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-base font-black text-gray-800 mb-4">Registrar Nuevo Paciente</h2>
          <form onSubmit={handleCrearPaciente} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre *</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Apellido *</label>
              <input 
                type="text" 
                value={apellido} 
                onChange={(e) => setApellido(e.target.value)} 
                required 
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">DNI / Documento *</label>
              <input 
                type="text" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                required 
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="12345678"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
              <input 
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="3515941281"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="paciente@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Obra Social / Prepaga</label>
              <input 
                type="text" 
                value={obraSocial} 
                onChange={(e) => setObraSocial(e.target.value)} 
                className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Particular, OSDE, etc."
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-colors shadow-sm mt-2"
            >
              Guardar Paciente
            </button>
          </form>
        </div>

        {/* Listado Pacientes con Buscador */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 md:col-span-2 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
            <div>
              <h2 className="text-base font-black text-gray-800">Listado de Pacientes</h2>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mt-1 inline-block">
                {pacientesFiltrados.length} de {pacientes.length} Registrados
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-xs">🔍</span>
              <input 
                type="text"
                placeholder="Buscar por Nombre, Apellido o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl pl-8 pr-3 py-2.5 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {cargando ? (
            <p className="text-xs text-gray-400">Cargando pacientes...</p>
          ) : pacientesFiltrados.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              {busqueda ? `No se encontraron resultados para "${busqueda}"` : 'No hay pacientes registrados aún.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Nombre y Apellido</th>
                    <th className="p-3">DNI</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Obra Social</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pacientesFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-blue-600">
                        <Link href={`/pacientes/${p.id}`} className="hover:underline">
                          {p.nombre} {p.apellido}
                        </Link>
                      </td>
                      <td className="p-3 font-medium text-gray-700">{p.dni}</td>
                      <td className="p-3 text-gray-600">{p.telefono || '-'}</td>
                      <td className="p-3 text-gray-600">{p.obra_social || 'Particular'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}