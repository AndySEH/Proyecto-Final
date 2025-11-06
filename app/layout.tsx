import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistema de Monitoreo UCI",
  description: "Monitoreo de pacientes UCI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
