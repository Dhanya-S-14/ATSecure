'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { X } from 'lucide-react';

export default function DashboardLayout({
  children,
  fullWidth = false
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-page)] text-[var(--text-body)] overflow-hidden font-sans selection:bg-[var(--brand-primary)] selection:text-white transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-[var(--bg-sidebar)] flex flex-col h-full z-10 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg-page)]">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className={`flex-1 overflow-y-auto ${fullWidth ? 'p-3 sm:p-4 lg:p-5' : 'p-4 sm:p-6 lg:p-8'} relative`}>
          <div className={`${fullWidth ? 'max-w-[1750px] w-full' : 'max-w-7xl'} mx-auto space-y-6`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
