import Link from "next/link";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { generateWebsiteJsonLd } from "@/lib/seo";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";
import { CatalogPreview } from "@/app/_components/catalog-preview";
import { getMusicList, getToggleList, getMonetizeConfig, getAllProjectFolders } from "@/lib/lo-cms";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder: targetFolder } = await searchParams;
  const { locale, dict } = await getCurrentDictionary();
  const websiteJsonLd = generateWebsiteJsonLd(locale);
  const isAuthenticated = await isAdminAuthenticated();

  const projectFolders = await getAllProjectFolders();
  const { items: musicList, selectedFolder } = await getMusicList(targetFolder);
  const { items: toggleList } = await getToggleList(selectedFolder);
  const { config: monetizeConfig } = await getMonetizeConfig(selectedFolder);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />

      {/* Main Header */}
      <Header appName={dict.common.appName} dictNav={dict.nav} isAuthenticated={isAuthenticated} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-12 md:p-16 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col items-start gap-6">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-3xl leading-[1.15]">
            {dict.home.heroTitle}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {dict.home.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 w-full sm:w-auto">
            <Link
              href="/admin/dashboard"
              className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              🚀 {dict.home.adminPortal}
            </Link>
            <a
              href="#catalog"
              className="inline-flex h-12 px-8 items-center justify-center rounded-xl glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-base transition-all active:scale-[0.98]"
            >
              👇 {dict.home.exploreCatalog}
            </a>
          </div>
        </section>

        {/* Real-time Interactive Catalog Section */}
        <section id="catalog" className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.home.previewTitle}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{dict.home.previewDesc}</p>
          </div>

          <CatalogPreview
            musicList={musicList}
            toggleList={toggleList}
            monetizeConfig={monetizeConfig}
            projectFolders={projectFolders}
            currentFolder={selectedFolder}
            dictCms={dict.cms}
          />
        </section>
      </main>

      {/* Main Footer */}
      <Footer appName={dict.common.appName} dictFooter={dict.footer} />
    </div>
  );
}
