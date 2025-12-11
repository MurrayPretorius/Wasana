import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Correcting import from "next/font/google"
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

import { ProjectProvider } from "@/context/ProjectContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CelebrationProvider } from "@/context/CelebrationContext";
import { NotificationProvider } from "@/context/NotificationContext";

// Use next/font to load Inter. It automatically configures it.
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Antigravity Project Manager",
  description: "A premium project management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <CelebrationProvider>
              <NotificationProvider>
                <ProjectProvider>
                  <MainLayout>
                    {children}
                  </MainLayout>
                </ProjectProvider>
              </NotificationProvider>
            </CelebrationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
