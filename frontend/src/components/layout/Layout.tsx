import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-shell">
        <Navbar />

        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
