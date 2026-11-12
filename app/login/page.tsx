'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/context/ConfigContext';

type RolUsuario = 'admin' | 'odontologo' | 'recepcion';

export default function LoginPage() {
  const router = useRouter();
  const { config } = useConfig() as any;

  const [rol, setRol] = useState<RolUsuario>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const rolesConfig: Record<RolUsuario, { titulo: string; subtitulo: string; icono: string; destino: string; nombreDefault: string }> = {
    admin: {
      titulo: 'Administrador',
      subtitulo: 'Acceso total a configuración, finanzas, agenda e historias',
      icono: '🛡️',
      destino: '/dashboard',
      nombreDefault: 'Dirección Médica'
    },
    odontologo: {
      titulo: 'Odontólogo',
      subtitulo: 'Acceso a agenda personal e historias clínicas de pacientes',
      icono: '👨‍⚕️',
      destino: '/turnos',
      nombreDefault: 'Od. Profesional'
    },
    recepcion: {
      titulo: 'Recepción',
      subtitulo: 'Gestión de turnos, admisión de pacientes y cobros',
      icono: '📋',
      destino: '/turnos',
      nombreDefault: 'Secretaría / Recepción'
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setCargando(true);

    try {
      // Intento de autenticación con el backend en Render
      const res = await fetch('https://medent-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rol })
      }).catch(() => null);

      let datosSesion = {
        email: email.trim(),
        rol,
        nombre: rolesConfig[rol].nombreDefault,
        autenticado: true,
        fechaIngreso: new Date().toISOString()
      };

      if (res && res.ok) {
        const data = await res.json();
        datosSesion = {
          ...datosSesion,
          nombre: data.nombre || datosSesion.nombre,
          rol: data.rol || rol
        };
      }

      localStorage.setItem('medent_sesion', JSON.stringify(datosSesion));
      router.push(rolesConfig[rol].destino);
    } catch {
      setError('Ocurrió un error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const ingresoRapidoDemo = (rolDemo: RolUsuario) => {
    const datosDemo = {
      email: `${rolDemo}@medent.com`,
      rol: rolDemo,
      nombre: rolesConfig[rolDemo].nombreDefault,
      autenticado: true,
      fechaIngreso: new Date().toISOString()
    };
    localStorage.setItem('medent_sesion', JSON.stringify(datosDemo));
    router.push(rolesConfig[rolDemo].destino);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
      {/* HEADER SIMPLE */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm"
            style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}
          >
            M
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 leading-none">
              {config?.nombreClinica || 'MeDent'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              Portal del Personal
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          ← Volver a Portada
        </Link>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900">Acceso al Sistema</h1>
            <p className="text-xs text-slate-500 font-medium">
              Selecciona tu perfil de trabajo e ingresa tus credenciales
            </p>
          </div>

          {/* SELECTOR DE ROL */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(rolesConfig) as RolUsuario[]).map((key) => {
              const item = rolesConfig[key];
              const activo = rol === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRol(key)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    activo
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">{item.icono}</span>
                  <span className="text-[11px] font-black">{item.titulo}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-[11px] font-bold text-slate-600">
              {rolesConfig[rol].subtitulo}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@clinica.com"
                className="w-full font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contraseña *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white font-black text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer"
              style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}
            >
              {cargando ? 'Verificando acceso...' : `Ingresar como ${rolesConfig[rol].titulo} →`}
            </button>
          </form>

          {/* ACCESOS DIRECTOS DE PRUEBA */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
              Acceso rápido por perfil (Modo Prueba)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => ingresoRapidoDemo('admin')}
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors cursor-pointer"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => ingresoRapidoDemo('odontologo')}
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors cursor-pointer"
              >
                👨‍⚕️ Odontólogo
              </button>
              <button
                type="button"
                onClick={() => ingresoRapidoDemo('recepcion')}
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors cursor-pointer"
              >
                📋 Recepción
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-4 text-center text-xs text-slate-400 bg-white border-t">
        {config?.nombreClinica || 'MeDent'} — Sistema de Gestión Odontológica
      </footer>
    </div>
  );
}