import { NavLink, Outlet } from 'react-router';

import ServerStatusBadge from '@/shared/ui/ServerStatusBadge';

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/adaptar', label: 'Adaptar' },
  { to: '/historico', label: 'Histórico' },
  { to: '/perfis', label: 'Perfis' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:min-h-0 print:bg-white">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-lg font-bold text-teal-700">Adapta Aí</span>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'font-semibold text-teal-700' : 'text-slate-600 hover:text-teal-700'
              }
            >
              {link.label}
            </NavLink>
          ))}
          {/* On every page, so the demo mode is always in sight (CA-001-27). */}
          <span className="ml-auto">
            <ServerStatusBadge />
          </span>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
