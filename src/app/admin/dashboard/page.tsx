import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMusicList, getToggleList, getMonetizeConfig, getAllProjectFolders } from "@/lib/lo-cms";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard — UukAak JSON CMS",
  description: "Kelola data JSON src/data/lo dengan CRUD, Enkripsi, & GitHub Commit Push Sync",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder: targetFolder } = await searchParams;
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const { dict } = await getCurrentDictionary();
  const projectFolders = await getAllProjectFolders();
  const { items: musicList, selectedFolder } = await getMusicList(targetFolder);
  const { items: toggleList } = await getToggleList(selectedFolder);
  const { config: monetizeConfig } = await getMonetizeConfig(selectedFolder);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      <Header appName={dict.common.appName} dictNav={dict.nav} isAuthenticated={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
        <DashboardClient
          musicList={musicList}
          toggleList={toggleList}
          monetizeConfig={monetizeConfig}
          projectFolders={projectFolders}
          currentFolder={selectedFolder}
          dictCms={dict.cms}
        />
      </main>

      <Footer appName={dict.common.appName} dictFooter={dict.footer} />
    </div>
  );
}
