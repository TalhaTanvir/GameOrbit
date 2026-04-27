import type { ReactNode } from "react";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import FloatingActionButtons from "@/components/layouts/FloatingActionButtons";

type WebsiteLayoutProps = {
  children: ReactNode;
};

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <FloatingActionButtons />
      <Footer />
    </div>
  );
}
