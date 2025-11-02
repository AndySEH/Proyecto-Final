import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ICU Monitor",
  description: "Monitoreo de pacientes UCI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b">
          <div className="container py-4">
            <h1 className="text-xl font-semibold">ICU Monitor</h1>
            <p className="text-sm text-gray-500">Dashboard de signos vitales</p>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
