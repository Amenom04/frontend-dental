'use client';

import { useEffect, useState } from 'react';

interface Turno {
  id: number;
  fecha: string;
  hora: string;
  profesional: string;
  estado: string;
}

const BLOQUES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

export default function DisponibilidadPacientesPage() {
  const [fecha, setFecha] = useState<string>('');
  const [turnosOcupados, setTurnosOcupados] = useState<Turno[]>([]);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFecha(hoy);
  }, []);

  useEffect(() => {
    if (!fecha) return;
    fetch(`[https://medent-backend.onrender.com](https://medent-backend.onrender.com)/api/turnos?fecha=${fecha}`)
      .then(res => res.json())
      .then(data => setTurnosOcupados(data))
      .catch(console.error);
  }, [fecha]);

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 max-w-3xl mx-auto space-y-6">
      <header className="text-center space-y-1">
        <h1 className="text-3xl font-black text-blue-600">MeDent</h1>
        <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Clínica Odontológica — Consultar Disponibilidad</p>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
        <label className="text-xs font-bold text-gray-700">Seleccionar Fecha de Consulta:</label>
        <input 
          type="date" 
          value={fecha} 
          onChange={(e) => setFecha(e.target.value)}
          className="border border-gray-300 rounded-xl p-2 text-xs font-bold bg-gray-50"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-3">
        <h2 className="text-sm font-bold border-b pb-2">
          Horarios Disponibles para el {fecha}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BLOQUES.map((h) => {
            const ocupado = turnosOcupados.some(t => t.hora.substring(0, 5) === h && t.estado !== 'Cancelado');
            return (
              <div 
                key={h}
                className={`p-3 rounded-xl border text-center transition-all ${
                  ocupado 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-50 border-green-300 text-green-800 font-bold hover:bg-green-100 cursor-pointer'
                }`}
              >
                <span className="text-sm block">⏰ {h} hs</span>
                <span className="text-[10px] uppercase font-bold block mt-0.5">
                  {ocupado ? 'No disponible' : 'Disponible'}
                </span>
                <span className="text-[9px] font-normal text-gray-500 block mt-1">Dr. Alejandro Rossi</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}