'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type RolStaff = 'Administrador' | 'Contador' | 'Recursos Humanos' | 'Odontologo' | 'Supervisor' | 'Secretaria';
type EstadoDiente = 'caries' | 'obturado' | 'conducto' | 'corona' | 'ausente' | 'normal';

interface Intervencion {
  id: number;
  diente: string;
  cara: string;
  estado: string;
  observacion: string;
  arancel: number;
}

interface PacienteData {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  obra_social: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

function ContenidoPaciente({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  // Estados del sistema y paciente
  const [rolActivo, setRolActivo] = useState<RolStaff>('Administrador');
  const [paciente, setPaciente] = useState<PacienteData | null>(null);
  const [cargando, setCargando] = useState(true);

  // Estados Odontograma
  const [modoDientes, setModoDientes] = useState<'permanentes' | 'temporales' | 'ambas'>('ambas');
  const [herramienta, setHerramienta] = useState<EstadoDiente>('caries');
  const [estadosPiezas, setEstadosPiezas] = useState<Record<string, EstadoDiente>>({});

  // Intervenciones registradas
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([
    { id: 1, diente: '#11', cara: 'GENERAL', estado: 'TRATAMIENTO', observacion: 'Extracción Compleja / Pieza Retenida', arancel: 45000 }
  ]);

  // Cargar datos del paciente desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/pacientes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPaciente(data);
        } else {
          // Si no responde la API individual, creamos una referencia limpia con la ID
          setPaciente({
            id: Number(id),
            nombre: 'Hugo',
            apellido: 'medran',
            dni: '14654651',
            telefono: '312165465',
            email: 'asdas@gmail.com',
            obra_social: 'Particular'
          });
        }
      } catch (error) {
        console.error('Error al cargar paciente:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  // Click en una pieza del odontograma
  const handlePiezaClick = (numeroDiente: string) => {
    const estadoActual = estadosPiezas[numeroDiente];
    const nuevoEstado = estadoActual === herramienta ? 'normal' : herramienta;

    setEstadosPiezas(prev => ({
      ...prev,
      [numeroDiente]: nuevoEstado
    }));

    if (nuevoEstado !== 'normal') {
      const nuevaIntervencion: Intervencion = {
        id: Date.now(),
        diente: `#${numeroDiente}`,
        cara: 'GENERAL',
        estado: nuevoEstado.toUpperCase(),
        observacion: `Diagnóstico / Tratamiento: ${nuevoEstado}`,
        arancel: nuevoEstado === 'caries' ? 15000 : nuevoEstado === 'conducto' ? 35000 : 20000
      };
      setIntervenciones(prev => [nuevaIntervencion, ...prev]);
    }
  };

  const totalAranceles = intervenciones.reduce((acc, curr) => acc + curr.arancel, 0);

  // Definición de Piezas Dentales
  const piezasPermanentesArriba = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
  const piezasPermanentesAbajo = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];
  const piezasTemporalesArriba = ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65'];
  const piezasTemporalesAbajo = ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75'];

  const getEstiloEstado = (estado?: EstadoDiente) => {
    switch (estado) {
      case 'caries': return 'bg-red-500 text-white border-red-600';
      case 'obturado': return 'bg-blue-500 text-white border-blue-600';
      case 'conducto': return 'bg-purple-500 text-white border-purple-600';
      case 'corona': return 'bg-amber-400 text-gray-900 border-amber-500';
      case 'ausente': return 'bg-gray-300 text-gray-700 line-through border-gray-400';
      default: return 'bg-white text-gray-700 border-gray-300 hover:border-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col">
      {/* CABECERA UNIFICADA DE NAVEGACIÓN GLOBAL */}
      <header className="bg-blue-600 text-white py-4 px-8 shadow-md flex justify-between items-center">
        {/* LOGO ENLAZADO A LANDING PRINCIPAL */}
        <Link href="/" className="group cursor-pointer">
          <h1 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-100 transition-colors">
            MeDent
          </h1>
          <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">
            Clínica Odontológica — Ficha Clínica #{id}
          </p>
        </Link>

        <div className="flex items-center gap-3">
          {/* Selector de Modo */}
          <div className="flex items-center gap-2 bg-blue-700 px-3 py-1.5 rounded-xl border border-blue-500">
            <span className="text-xs font-extrabold text-blue-100">Modo:</span>
            <select
              value={rolActivo}
              onChange={(e) => setRolActivo(e.target.value as RolStaff)}
              className="bg-white text-blue-900 font-extrabold text-xs py-1 px-2 rounded-lg outline-none cursor-pointer"
            >
              <option value="Administrador">Administrador</option>
              <option value="Contador">Contador</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Odontologo">Odontólogo</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Secretaria">Secretaría</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors"
          >
            🖨️ Imprimir / Guardar PDF (A4)
          </button>

          <Link 
            href="/pacientes" 
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-xl text-xs border border-blue-500 transition-colors"
          >
            ← Volver a Pacientes
          </Link>

          <button
            onClick={handleCerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL FICHA PACIENTE */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* PANEL LATERAL: INFORMACIÓN DEL PACIENTE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 h-fit space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-lg border border-blue-200">
              {paciente?.nombre?.[0] || 'P'}{paciente?.apellido?.[0] || 'M'}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 leading-tight">
                {paciente?.nombre} {paciente?.apellido}
              </h2>
              <p className="text-xs text-blue-600 font-bold">DNI: {paciente?.dni}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 font-medium block">Teléfono</span>
              <span className="font-bold text-gray-800">{paciente?.telefono || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Email</span>
              <span className="font-bold text-gray-800 truncate block">{paciente?.email || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Obra Social / Prepaga</span>
              <span className="font-bold text-gray-800">{paciente?.obra_social || 'Particular'}</span>
            </div>
          </div>
        </div>

        {/* DETALLE PRINCIPAL: ODONTOGRAMA Y REGISTROS */}
        <div className="md:col-span-3 space-y-6">
          
          {/* TAB PANEL */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center gap-6 border-b pb-3 text-xs font-black text-gray-500">
              <span className="text-blue-600 border-b-2 border-blue-600 pb-3 cursor-pointer">
                🦷 Odontograma Digital Anatómico
              </span>
              <span className="hover:text-gray-800 cursor-pointer">
                📝 Plan de Tratamiento y Presupuesto
              </span>
              <span className="hover:text-gray-800 cursor-pointer">
                📁 Estudios y Documentos (0)
              </span>
            </div>

            {/* CONTROLES DEL ODONTOGRAMA */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              
              {/* Selectores de Vista Dentición */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold">
                <span className="text-gray-400 px-2 text-[10px] uppercase">Vista:</span>
                <button 
                  onClick={() => setModoDientes('permanentes')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${modoDientes === 'permanentes' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-black'}`}
                >
                  Permanentes
                </button>
                <button 
                  onClick={() => setModoDientes('temporales')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${modoDientes === 'temporales' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-black'}`}
                >
                  Temporales (Niños)
                </button>
                <button 
                  onClick={() => setModoDientes('ambas')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${modoDientes === 'ambas' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-black'}`}
                >
                  Ver Ambas
                </button>
              </div>

              {/* Lápiz / Herramienta activa */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-gray-400 text-[10px] uppercase">✏️ Lápiz:</span>
                <button onClick={() => setHerramienta('caries')} className={`px-2 py-1 rounded-lg border ${herramienta === 'caries' ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-300' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  🔴 Caries
                </button>
                <button onClick={() => setHerramienta('obturado')} className={`px-2 py-1 rounded-lg border ${herramienta === 'obturado' ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  🔵 Obturado
                </button>
                <button onClick={() => setHerramienta('conducto')} className={`px-2 py-1 rounded-lg border ${herramienta === 'conducto' ? 'bg-purple-500 text-white border-purple-600 ring-2 ring-purple-300' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                  🟣 Conducto
                </button>
                <button onClick={() => setHerramienta('corona')} className={`px-2 py-1 rounded-lg border ${herramienta === 'corona' ? 'bg-amber-400 text-gray-900 border-amber-500 ring-2 ring-amber-300' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  🟡 Corona
                </button>
                <button onClick={() => setHerramienta('ausente')} className={`px-2 py-1 rounded-lg border ${herramienta === 'ausente' ? 'bg-gray-400 text-white border-gray-500 ring-2 ring-gray-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                  ❌ Ausente
                </button>
              </div>
            </div>

            {/* GRILLA INTERACTIVA DEL ODONTOGRAMA */}
            <div className="space-y-6 py-4 overflow-x-auto">
              
              {/* PIEZAS PERMANENTES */}
              {(modoDientes === 'permanentes' || modoDientes === 'ambas') && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 text-center tracking-widest">
                    Piezas Permanentes (Adultos)
                  </h4>
                  
                  {/* Arriba */}
                  <div className="flex justify-center gap-1">
                    {piezasPermanentesArriba.map(nro => (
                      <div key={nro} className="text-center">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">{nro}</span>
                        <button
                          onClick={() => handlePiezaClick(nro)}
                          className={`w-8 h-8 rounded-lg border font-black text-xs transition-all ${getEstiloEstado(estadosPiezas[nro])}`}
                        >
                          {nro}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Abajo */}
                  <div className="flex justify-center gap-1 pt-2">
                    {piezasPermanentesAbajo.map(nro => (
                      <div key={nro} className="text-center">
                        <button
                          onClick={() => handlePiezaClick(nro)}
                          className={`w-8 h-8 rounded-lg border font-black text-xs transition-all ${getEstiloEstado(estadosPiezas[nro])}`}
                        >
                          {nro}
                        </button>
                        <span className="text-[10px] font-bold text-gray-400 block mt-1">{nro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PIEZAS TEMPORALES */}
              {(modoDientes === 'temporales' || modoDientes === 'ambas') && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 text-center tracking-widest">
                    Piezas Temporales (Niños)
                  </h4>

                  <div className="flex justify-center gap-1">
                    {piezasTemporalesArriba.map(nro => (
                      <div key={nro} className="text-center">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">{nro}</span>
                        <button
                          onClick={() => handlePiezaClick(nro)}
                          className={`w-8 h-8 rounded-lg border font-black text-xs transition-all ${getEstiloEstado(estadosPiezas[nro])}`}
                        >
                          {nro}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-1 pt-2">
                    {piezasTemporalesAbajo.map(nro => (
                      <div key={nro} className="text-center">
                        <button
                          onClick={() => handlePiezaClick(nro)}
                          className={`w-8 h-8 rounded-lg border font-black text-xs transition-all ${getEstiloEstado(estadosPiezas[nro])}`}
                        >
                          {nro}
                        </button>
                        <span className="text-[10px] font-bold text-gray-400 block mt-1">{nro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TABLA DE INTERVENCIONES Y ARANCELES */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-800">Intervenciones Registradas</h3>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Total: ${totalAranceles.toLocaleString('es-AR')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Diente</th>
                      <th className="p-2.5">Cara</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5">Observación</th>
                      <th className="p-2.5 text-right">Arancel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {intervenciones.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-black text-blue-600">{item.diente}</td>
                        <td className="p-2.5 font-bold text-gray-500">{item.cara}</td>
                        <td className="p-2.5">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-blue-200">
                            {item.estado}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-600">{item.observacion}</td>
                        <td className="p-2.5 text-right font-black text-gray-900">${item.arancel.toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function PacienteDetallePage(props: Props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Cargando expediente...</div>}>
      <ContenidoPaciente {...props} />
    </Suspense>
  );
}