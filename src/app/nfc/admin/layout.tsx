import type { Metadata } from "next";

export const metadata: Metadata = { title: "Diggy Dash" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
