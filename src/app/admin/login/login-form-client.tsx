"use client";

import React, { useActionState, useState } from "react";
import { loginAdminAction } from "@/app/admin/actions";
import { GlassCard, Button, Input } from "@/app/_components/ui-components";

export function LoginFormClient({
  dictAuth,
}: {
  dictAuth: {
    loginTitle: string;
    loginSubtitle: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitLogin: string;
  };
}) {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GlassCard className="w-full flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-indigo-500/30">
          🔐
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{dictAuth.loginTitle}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{dictAuth.loginSubtitle}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-shake">
            ⚠️ {state.error}
          </div>
        )}

        <div className="relative flex flex-col gap-1">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label={dictAuth.passwordLabel}
            placeholder={dictAuth.passwordPlaceholder}
            required
            disabled={isPending}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            {showPassword ? "🙈 Sembunyikan" : "👁️ Intip"}
          </button>
        </div>

        <Button type="submit" isLoading={isPending} className="w-full mt-2">
          {dictAuth.submitLogin}
        </Button>
      </form>
    </GlassCard>
  );
}
