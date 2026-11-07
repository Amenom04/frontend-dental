import type { Metadata } from 'next';
import './globals.css';
import { ConfigProvider } from '../context/ConfigContext';

export const metadata: Metadata = {
  title: 'MeDent - Clínica Odontológica',
  description: 'Sistema Integral de Gestión Odontológica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}