import { NavLink, Outlet } from 'react-router';

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/adaptar', label: 'Adaptar' },
  { to: '/historico', label: 'Histórico' },
  { to: '/perfis', label: 'Perfis' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
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
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
