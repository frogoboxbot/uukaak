"use client";

import React, { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// 1. Button component supporting 8 states
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  isError = false,
  isSuccess = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500 dark:hover:bg-indigo-600",
    secondary: "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100",
    destructive: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 dark:bg-red-500 dark:hover:bg-red-600",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
    outline: "bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5 min-w-[36px]",
    md: "px-5 py-2.5 text-base gap-2 min-w-[44px]",
    lg: "px-6 py-3.5 text-lg gap-2.5 min-w-[52px]",
  };

  let stateStyle = "";
  if (isError) {
    stateStyle = "bg-red-600 text-white ring-2 ring-red-400 animate-shake";
  } else if (isSuccess) {
    stateStyle = "bg-emerald-600 text-white ring-2 ring-emerald-400";
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${stateStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Memuat...</span>
        </span>
      ) : isError ? (
        <span className="flex items-center gap-2">
          <span>⚠️ Gagal</span>
        </span>
      ) : isSuccess ? (
        <span className="flex items-center gap-2">
          <span>✓ Berhasil</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// 2. Glassmorphism Card
export function GlassCard({
  children,
  className = "",
  hoverEffect = false,
}: {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 shadow-xl transition-all duration-300 ${
        hoverEffect ? "hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-500/30" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// 3. Status Badge
export function Badge({
  children,
  variant = "info",
  className = "",
}: {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "danger" | "purple";
  className?: string;
}) {
  const styles = {
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// 4. Input Field
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full h-11 px-4 rounded-xl border bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
          error ? "border-red-500 ring-2 ring-red-500/20" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
}

// 5. Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

// 6. Toast Notification Banner
export function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
}) {
  if (!message) return null;

  const bg = type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white";

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl ${bg} animate-slideUp`}>
      <span className="text-sm font-semibold">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white cursor-pointer" aria-label="Dismiss toast">
          ✕
        </button>
      )}
    </div>
  );
}
