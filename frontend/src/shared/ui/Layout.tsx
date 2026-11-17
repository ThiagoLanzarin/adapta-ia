import { Link, NavLink, Outlet } from 'react-router';

import Icon, { type IconName } from '@/shared/ui/Icon';
import Logo from '@/shared/ui/Logo';
import ServerStatusBadge from '@/shared/ui/ServerStatusBadge';

const LINKS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/adaptar', label: 'Adaptar', icon: 'sparkles' },
  { to: '/historico', label: 'Histórico', icon: 'clock' },
  { to: '/perfis', label: 'Perfis', icon: 'user' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 print:block print:min-h-0">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-card"
      >
        Pular para o conteúdo
      </a>
      <header className="z-30 md:sticky md:top-0 border-b border-slate-200/80 bg-white/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 rounded-lg">
            <Logo />
            <span className="text-xl font-bold tracking-tight text-brand-800">Adapta Aí</span>
          </Link>
          <nav
            aria-label="Principal"
            className="order-last -mx-1 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto"
          >
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-brand-50 font-semibold text-brand-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon name={link.icon} className="size-[1.1rem]" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          {/* On every page, so the demo mode is always in sight (CA-001-27). */}
          <div className="ml-auto">
            <ServerStatusBadge />
          </div>
        </div>
      </header>
      <main
        id="conteudo"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10 print:max-w-none print:p-0"
      >
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/60 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-slate-500">
          <p className="flex items-center gap-2">
            <Icon name="lock" className="size-4" />
            Gratuito e sem login. Perfis e histórico ficam só neste navegador.
          </p>
          <p>
            Pictogramas:{' '}
            <a
              href="https://arasaac.org"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-brand-700"
            >
              ARASAAC
            </a>{' '}
            (CC BY-NC-SA)
          </p>
        </div>
      </footer>
    </div>
  );
}
