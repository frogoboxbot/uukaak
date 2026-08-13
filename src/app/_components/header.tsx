import Link from "next/link";
// Note: Switchers disiapkan di kode tetapi default hide/gone sesuai aturan GUIDELINE.md
// import { LanguageSwitcher } from "./language-switcher";
// import { ThemeSwitcher } from "./theme-switcher";

export function Header({
  appName,
  dictNav,
  isAuthenticated = false,
}: {
  appName: string;
  dictNav: {
    home: string;
    dashboard: string;
    login: string;
    logout: string;
    catalog: string;
  };
  isAuthenticated?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            UA
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {appName}
          </span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg"
          >
            {dictNav.home}
          </Link>

          {isAuthenticated ? (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
            >
              <span>⚙️ {dictNav.dashboard}</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm"
            >
              <span>🔑 {dictNav.login}</span>
            </Link>
          )}

          {/* Switchers disiapkan tetapi default di-hide/gone sampai ada request show dari user */}
          {/* <div className="hidden">
            <ThemeSwitcher labels={{ label: "Tema", light: "Terang", dark: "Gelap", system: "Sistem" }} />
            <LanguageSwitcher currentLocale="id" />
          </div> */}
        </div>
      </div>
    </header>
  );
}
