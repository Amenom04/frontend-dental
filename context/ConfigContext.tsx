'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OdontologoConfig {
  id: number;
  nombre: string;
  especialidad: string;
}

export interface GeneralConfig {
  nombreClinica: string;
  tipoTipografia: string;
  telefonoContacto: string;
  direccion: string;
  
  bannerPromocional: string;
  whatsappNumero: string;
  whatsappMensaje: string;

  logoUrl: string;
  logoTamano: number;
  mostrarNombreJuntoALogo: boolean;
  colorPrimario: string;
  colorFondo: string;

  // Foto 1 (Hero)
  fondoFoto1Url: string;
  foto1Tamano: number; // en px
  foto1PosY: number;   // en px desde top
  foto1PosX: number;   // en px desde right

  // Foto 2 (Servicios)
  fondoFoto2Url: string;
  foto2Tamano: number; // en px
  foto2PosY: number;   // porcentaje o px
  foto2PosX: number;   // en px desde left

  // Foto 3 (Footer)
  fondoFoto3Url: string;
  foto3Tamano: number; // en px
  foto3PosY: number;   // en px desde bottom
  foto3PosX: number;   // en px desde right

  fondoOpacidad: number;
}

interface ConfigContextType {
  config: GeneralConfig;
  updateConfig: (nuevaConfig: Partial<GeneralConfig>) => void;
  practicas: string[];
  odontologos: OdontologoConfig[];
  agregarPractica: (nueva: string) => void;
  eliminarPractica: (practica: string) => void;
  agregarOdontologo: (nuevo: { nombre: string; especialidad: string }) => void;
  eliminarOdontologo: (id: number) => void;
}

const configInicial: GeneralConfig = {
  nombreClinica: 'MeDent Clínica Odontológica',
  tipoTipografia: 'font-sans',
  telefonoContacto: '03511234567',
  direccion: 'Av. Colón 1234',
  bannerPromocional: '💳 Hasta 12 cuotas sin interés en tratamientos de Ortodoncia e Implantes',
  whatsappNumero: '5493511234567',
  whatsappMensaje: 'Hola! Quisiera realizar una consulta sobre turnos y tratamientos.',
  logoUrl: '',
  logoTamano: 45,
  mostrarNombreJuntoALogo: true,
  colorPrimario: '#2563eb',
  colorFondo: '#f8fafc',
  
  // Ajustes iniciales optimizados para Foto 1
  fondoFoto1Url: '',
  foto1Tamano: 420,
  foto1PosY: 80,
  foto1PosX: 0,

  fondoFoto2Url: '',
  foto2Tamano: 380,
  foto2PosY: 50,
  foto2PosX: 0,

  fondoFoto3Url: '',
  foto3Tamano: 380,
  foto3PosY: 0,
  foto3PosX: 0,

  fondoOpacidad: 0.15
};

const practicasIniciales = [
  'Odontología General / Consulta',
  'Limpieza Dental / Profilaxis',
  'Consulta por Ortodoncia',
  'Cirugía Maxilofacial',
  'Guardia / Urgencia Dental',
  'Diagnóstico Radiológico (Pantomografía)'
];

const odontologosIniciales: OdontologoConfig[] = [
  { id: 1, nombre: 'Od. Sofía Martínez', especialidad: 'Cirugía Maxilofacial' },
  { id: 2, nombre: 'Od. González', especialidad: 'Odontología General' },
  { id: 3, nombre: 'Od. Graciela Quiroga', especialidad: 'Odontología General' },
  { id: 4, nombre: 'Od. Hugo Medran', especialidad: 'Guardia' },
  { id: 5, nombre: 'Od. Fermín Ballester', especialidad: 'Guardia' },
  { id: 6, nombre: 'Od. Rodolfo Medran', especialidad: 'Guardia' },
  { id: 7, nombre: 'Od. María González', especialidad: 'Ortodoncia' },
  { id: 8, nombre: 'Od. Diagnóstico Radiológico', especialidad: 'Pantomografía y Diagnóstico' }
];

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GeneralConfig>(configInicial);
  const [practicas, setPracticas] = useState<string[]>(practicasIniciales);
  const [odontologos, setOdontologos] = useState<OdontologoConfig[]>(odontologosIniciales);

  useEffect(() => {
    const configGuardada = localStorage.getItem('medent_config_general');
    if (configGuardada) setConfig(JSON.parse(configGuardada));

    const practicasGuardadas = localStorage.getItem('medent_practicas');
    if (practicasGuardadas) setPracticas(JSON.parse(practicasGuardadas));

    const odontologosGuardados = localStorage.getItem('medent_odontologos');
    if (odontologosGuardados) setOdontologos(JSON.parse(odontologosGuardados));
  }, []);

  const updateConfig = (nuevaConfig: Partial<GeneralConfig>) => {
    const combinada = { ...config, ...nuevaConfig };
    setConfig(combinada);
    localStorage.setItem('medent_config_general', JSON.stringify(combinada));
  };

  const agregarPractica = (nueva: string) => {
    if (!nueva.trim() || practicas.includes(nueva)) return;
    const actualizadas = [...practicas, nueva.trim()];
    setPracticas(actualizadas);
    localStorage.setItem('medent_practicas', JSON.stringify(actualizadas));
  };

  const eliminarPractica = (practicaAEliminar: string) => {
    const actualizadas = practicas.filter(p => p !== practicaAEliminar);
    setPracticas(actualizadas);
    localStorage.setItem('medent_practicas', JSON.stringify(actualizadas));
  };

  const agregarOdontologo = (nuevo: { nombre: string; especialidad: string }) => {
    if (!nuevo.nombre.trim()) return;
    const nuevoObj: OdontologoConfig = {
      id: Date.now(),
      nombre: nuevo.nombre.trim(),
      especialidad: nuevo.especialidad.trim() || 'Odontología General'
    };
    const actualizados = [...odontologos, nuevoObj];
    setOdontologos(actualizados);
    localStorage.setItem('medent_odontologos', JSON.stringify(actualizados));
  };

  const eliminarOdontologo = (id: number) => {
    const actualizados = odontologos.filter(o => o.id !== id);
    setOdontologos(actualizados);
    localStorage.setItem('medent_odontologos', JSON.stringify(actualizados));
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        practicas,
        odontologos,
        agregarPractica,
        eliminarPractica,
        agregarOdontologo,
        eliminarOdontologo
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig debe usarse dentro de un ConfigProvider');
  return context;
}