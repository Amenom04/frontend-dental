'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProteccionRutaProps {
  children: React.ReactNode;
  rolesPermitidos?: Array<'admin' | 'odontologo' | 'recepcion'>;
}

export default function ProteccionRuta({
  children,
  rolesPermitidos = ['admin']
}: ProteccionRutaProps) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const sesionRaw = localStorage.getItem('medent_sesion');

    if (!sesionRaw) {
      router.replace('/login');
      return;
    }

    try {
      const sesion = JSON.parse(sesionRaw);

      if (!sesion.autenticado) {
        router.replace('/login');
        return;
      }

      if (!rolesPermitidos.includes(sesion.rol)) {
        // Si tiene sesión pero no permiso para esta ruta, lo enviamos a la agenda
        router.replace('/turnos');
        return;
      }

      setAutorizado(true);
    } catch {
      localStorage.removeItem('medent_sesion');
      router.replace('/login');
    }
  }, [router, rolesPermitidos]);

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-black uppercase tracking-widest">Verificando permisos de acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}