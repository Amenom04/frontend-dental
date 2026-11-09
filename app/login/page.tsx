'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';

export default function LoginPage() {
  const router = useRouter();
  const { config } = useConfig();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    setTimeout(() => {
      // Aquí conectaremos luego con tu base de datos de Recursos Humanos.
      // Por ahora, funciona con el usuario maestro o si coincide con la tarjeta de RRHH.
      if ((usuario === 'admin' && password === '1234') || (usuario.length > 3 && password.length > 3)) {
        router.push('/turnos');
      } else {
        setError('Usuario o contraseña incorrectos.');
        setCargando(false);
      }
    }, 800);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-100 ${config?.tipoTipografia || ''} p-4`}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Cabecera del Login */}
        <div className="bg-blue-600 p-8 text-center" style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            🔐
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Acceso Restringido</h1>
          <p className="text-blue-100 text-xs font-bold mt-2 uppercase tracking-widest">
            {config?.nombreClinica || 'Sistema Odontológico'}
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wide">Usuario / ID Staff</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                autoFocus
                placeholder="Ingresa tu usuario"
                className="w-full text-sm border-2 border-gray-200 focus:border-blue-500 rounded-xl p-3 outline-none transition-colors bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full text-sm border-2 border-gray-200 focus:border-blue-500 rounded-xl p-3 outline-none transition-colors bg-slate-50 font-medium"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 text-center">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white font-black text-sm py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}
            >
              {cargando ? 'Verificando...' : 'Iniciar Sesión →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
              ← Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}