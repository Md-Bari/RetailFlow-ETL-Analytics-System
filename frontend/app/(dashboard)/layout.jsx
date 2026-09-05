"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ApiKeyModal from "../../components/ApiKeyModal";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState({ name: "Loading...", email: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex print:bg-white print:block">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen print:ml-0 print:h-auto print:block">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 print:hidden">
          <div className="flex items-center">
            <button className="p-2 -ml-2 text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <ApiKeyModal />
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#f4f6f9] print:bg-white print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto w-full print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
