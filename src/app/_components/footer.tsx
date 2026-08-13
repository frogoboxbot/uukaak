import Link from "next/link";

export function Footer({
  appName,
  dictFooter,
}: {
  appName: string;
  dictFooter: {
    copyright: string;
    securityInfo: string;
  };
}) {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900 dark:text-slate-200">{appName}</span>
          <span>•</span>
          <span>{dictFooter.copyright}</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/login" className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
