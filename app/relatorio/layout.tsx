import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relatório de Testes",
  robots: "noindex",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
