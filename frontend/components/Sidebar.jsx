"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UploadCloud, Settings2, FileText, AlertOctagon, Terminal, LogOut, MessageSquare } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat Assistant", href: "/chat", icon: MessageSquare },
    { name: "Upload Data", href: "/upload", icon: UploadCloud },
    { name: "EDA & Preprocessing", href: "/eda", icon: Settings2 },
    { name: "AI Reports", href: "/reports", icon: FileText },
    { name: "Failed Records", href: "/failed-records", icon: AlertOctagon },
    { name: "System Logs", href: "/logs", icon: Terminal },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col text-white" style={{ background: "#1b213b" }}>
      <div className="p-5 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-tight text-white flex flex-col items-center">
          <span className="text-blue-400">Retail</span>Flow
          <span className="text-[10px] uppercase text-green-400 font-normal tracking-widest mt-1">Analytics</span>
        </h1>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link 
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  <link.icon size={18} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link 
          href="/" 
          onClick={() => {
            localStorage.removeItem("auth_user");
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </aside>
  );
}
