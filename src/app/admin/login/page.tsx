import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";
import { LoginFormClient } from "./login-form-client";

export const metadata: Metadata = {
  title: "Admin Sign In — UukAak JSON CMS",
  description: "Masuk ke portal administrator UukAak JSON CMS",
};

export default async function AdminLoginPage() {
  const isAuth = await isAdminAuthenticated();
  if (isAuth) {
    redirect("/admin/dashboard");
  }

  const { dict } = await getCurrentDictionary();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      <Header appName={dict.common.appName} dictNav={dict.nav} isAuthenticated={false} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col justify-center items-center">
        <LoginFormClient dictAuth={dict.auth} />
      </main>

      <Footer appName={dict.common.appName} dictFooter={dict.footer} />
    </div>
  );
}
