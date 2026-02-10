import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VoiceSessionProvider } from "@/context/VoiceSessionContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Credito Voz — Solicitud de Credito",
  description: "Llena tu solicitud de credito conversando con un agente de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <VoiceSessionProvider>{children}</VoiceSessionProvider>
      </body>
    </html>
  );
}
