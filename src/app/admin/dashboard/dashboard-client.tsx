"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MusicItem, ToggleItem, MonetizeConfig, ProjectFolder } from "@/lib/lo-cms";
import { GlassCard, Badge, Button, Input, Modal, Toast } from "@/app/_components/ui-components";
import { getFolderDisplayName, resolveMd5 } from "@/lib/md5-map";
import {
  logoutAdminAction,
  createMusicAction,
  updateMusicAction,
  deleteMusicAction,
  createToggleAction,
  updateToggleAction,
  deleteToggleAction,
} from "@/app/admin/actions";

export function DashboardClient({
  musicList,
  toggleList,
  monetizeConfig,
  projectFolders = [],
  currentFolder = "",
  dictCms,
}: {
  musicList: MusicItem[];
  toggleList: ToggleItem[];
  monetizeConfig: MonetizeConfig | null;
  projectFolders?: ProjectFolder[];
  currentFolder?: string;
  dictCms: {
    musicTitle: string;
    toggleTitle: string;
    monetizeTitle: string;
    musicTab: string;
    toggleTab: string;
    monetizeTab: string;
    fieldTitle: string;
    fieldUrl: string;
    fieldBaseUrl: string;
    fieldKey: string;
    fieldState: string;
    fieldValue: string;
    githubStatus: string;
    lastCommit: string;
    confirmDelete: string;
    confirmDeleteDesc: string;
  };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"music" | "toggle" | "monetize">("music");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  // Modals
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicItem | null>(null);
  const [deletingMusicId, setDeletingMusicId] = useState<string | null>(null);

  const [isAddToggleOpen, setIsAddToggleOpen] = useState(false);
  const [editingToggle, setEditingToggle] = useState<ToggleItem | null>(null);
  const [deletingToggleId, setDeletingToggleId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const folder = e.target.value;
    router.push(`/admin/dashboard?folder=${encodeURIComponent(folder)}`);
  };

  const [musicPage, setMusicPage] = useState(1);
  const [togglePage, setTogglePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setMusicPage(1);
    setTogglePage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setMusicPage(1);
    setTogglePage(1);
  };

  const filteredMusic = musicList.filter(
    (m) =>
      m.music_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.obfuscatedId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredToggles = toggleList.filter(
    (t) =>
      t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMusicPages = Math.ceil(filteredMusic.length / itemsPerPage) || 1;
  const paginatedMusic = filteredMusic.slice((musicPage - 1) * itemsPerPage, musicPage * itemsPerPage);

  const totalTogglePages = Math.ceil(filteredToggles.length / itemsPerPage) || 1;
  const paginatedToggles = filteredToggles.slice((togglePage - 1) * itemsPerPage, togglePage * itemsPerPage);

  // Handlers for Music CRUD
  const handleCreateMusic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createMusicAction(formData);
      showToast(res.message, res.success ? "success" : "error");
      if (res.success) setIsAddMusicOpen(false);
    });
  };

  const handleUpdateMusic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateMusicAction(formData);
      showToast(res.message, res.success ? "success" : "error");
      if (res.success) setEditingMusic(null);
    });
  };

  const handleDeleteMusic = (obfuscatedId: string) => {
    startTransition(async () => {
      const res = await deleteMusicAction(obfuscatedId, currentFolder);
      showToast(res.message, res.success ? "success" : "error");
      setDeletingMusicId(null);
    });
  };

  // Handlers for Toggle CRUD
  const handleCreateToggle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createToggleAction(formData);
      showToast(res.message, res.success ? "success" : "error");
      if (res.success) setIsAddToggleOpen(false);
    });
  };

  const handleUpdateToggle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateToggleAction(formData);
      showToast(res.message, res.success ? "success" : "error");
      if (res.success) setEditingToggle(null);
    });
  };

  const handleDeleteToggle = (obfuscatedId: string) => {
    startTransition(async () => {
      const res = await deleteToggleAction(obfuscatedId, currentFolder);
      showToast(res.message, res.success ? "success" : "error");
      setDeletingToggleId(null);
    });
  };

  // Group project folders by topFolderHash (outer project package)
  const groupedFolders = projectFolders.reduce((acc, folder) => {
    const key = folder.topFolderHash || "default";
    if (!acc[key]) acc[key] = [];
    acc[key].push(folder);
    return acc;
  }, {} as Record<string, ProjectFolder[]>);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}

      {/* Unified Project Folder & Git Status Control Bar */}
      <GlassCard className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 text-white border border-indigo-500/30 p-5 shadow-xl">
        {/* Left Info Section */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl font-bold shrink-0">
            📂
            <span className="absolute -bottom-1 -right-1 text-xs bg-slate-900 border border-indigo-500/40 rounded-full w-5 h-5 flex items-center justify-center shadow">
              🐙
            </span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-base text-slate-100">
                Pilih Proyek / Folder Data
              </span>
              <Badge variant="success" className="text-xs py-0.5 px-2.5">
                ✓ GitHub API Live
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono truncate flex-wrap">
              <span className="text-emerald-400 font-semibold">{dictCms.githubStatus}</span>
              <span className="text-slate-500">•</span>
              <span className="truncate">
                Target: <code className="text-indigo-300 font-bold bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">src/data/lo/{getFolderDisplayName(currentFolder)}</code>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action & Controls Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
          {projectFolders.length > 0 && (
            <div className="w-full sm:w-80 md:w-96">
              <select
                value={currentFolder}
                onChange={handleFolderChange}
                className="w-full h-11 px-4 rounded-xl border border-indigo-500/50 bg-slate-900/95 text-slate-100 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-md"
              >
                {Object.entries(groupedFolders).map(([topHash, folders], idx) => {
                  const topName = resolveMd5(topHash);
                  const topLabel = topName !== topHash ? topName : `${topHash.slice(0, 10)}...`;
                  return (
                    <optgroup
                      key={topHash}
                      label={`📦 Folder Utama #${idx + 1}: ${topLabel} (${folders.length} Game)`}
                    >
                      {folders.map((f) => (
                        <option key={f.id} value={f.relativePath}>
                          🎮 {f.gameName} ({f.gameFolderHash.slice(0, 6)}...)
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          )}

          <form action={logoutAdminAction} className="shrink-0">
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <span>🚪</span>
              <span>Logout Admin</span>
            </button>
          </form>
        </div>
      </GlassCard>

      {/* Tab Header & Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("music")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "music"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            🎵 {dictCms.musicTab} ({musicList.length})
          </button>
          <button
            onClick={() => setActiveTab("toggle")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "toggle"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            🎛️ {dictCms.toggleTab} ({toggleList.length})
          </button>
          <button
            onClick={() => setActiveTab("monetize")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "monetize"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            💰 {dictCms.monetizeTab}
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Input
            placeholder="Cari record..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-10 text-xs w-full sm:w-56"
          />

          {activeTab === "music" && (
            <Button size="sm" className="whitespace-nowrap shrink-0 px-4" onClick={() => setIsAddMusicOpen(true)}>
              ➕ Tambah Musik
            </Button>
          )}

          {activeTab === "toggle" && (
            <Button size="sm" className="whitespace-nowrap shrink-0 px-4" onClick={() => setIsAddToggleOpen(true)}>
              ➕ Tambah Toggle
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Music CRUD Table */}
      {activeTab === "music" && (
        <GlassCard className="flex flex-col gap-4 overflow-hidden p-0 sm:p-6">
          <div className="px-4 pt-4 sm:p-0 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dictCms.musicTitle}</h3>
            <Badge variant="purple">Proyek: {getFolderDisplayName(currentFolder)}</Badge>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Sqids ID</th>
                  <th className="py-3 px-4">{dictCms.fieldTitle}</th>
                  <th className="py-3 px-4">{dictCms.fieldUrl}</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {paginatedMusic.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      #{item.obfuscatedId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.music_title.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{item.music_url}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingMusic(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingMusicId(item.obfuscatedId)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Music Table Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan {filteredMusic.length === 0 ? 0 : (musicPage - 1) * itemsPerPage + 1} - {Math.min(musicPage * itemsPerPage, filteredMusic.length)} dari {filteredMusic.length} musik
              </span>
              <div className="flex items-center gap-1.5 font-medium">
                <span>• Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="h-7 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>/ hal</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={musicPage <= 1}
                onClick={() => setMusicPage((prev) => Math.max(prev - 1, 1))}
              >
                ⬅️ Sebelumnya
              </Button>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Halaman {musicPage} dari {totalMusicPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={musicPage >= totalMusicPages}
                onClick={() => setMusicPage((prev) => Math.min(prev + 1, totalMusicPages))}
              >
                Selanjutnya ➡️
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 2: Toggle CRUD Table */}
      {activeTab === "toggle" && (
        <GlassCard className="flex flex-col gap-4 overflow-hidden p-0 sm:p-6">
          <div className="px-4 pt-4 sm:p-0 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dictCms.toggleTitle}</h3>
            <Badge variant="info">Proyek: {getFolderDisplayName(currentFolder)}</Badge>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Sqids ID</th>
                  <th className="py-3 px-4">{dictCms.fieldKey}</th>
                  <th className="py-3 px-4">{dictCms.fieldState}</th>
                  <th className="py-3 px-4">{dictCms.fieldValue}</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {paginatedToggles.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      #{item.obfuscatedId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{item.key}</td>
                    <td className="py-3 px-4">
                      <Badge variant={item.state ? "success" : "danger"}>
                        {item.state ? "TRUE" : "FALSE"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{item.value}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingToggle(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingToggleId(item.obfuscatedId)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Toggle Table Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan {filteredToggles.length === 0 ? 0 : (togglePage - 1) * itemsPerPage + 1} - {Math.min(togglePage * itemsPerPage, filteredToggles.length)} dari {filteredToggles.length} toggle
              </span>
              <div className="flex items-center gap-1.5 font-medium">
                <span>• Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="h-7 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>/ hal</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={togglePage <= 1}
                onClick={() => setTogglePage((prev) => Math.max(prev - 1, 1))}
              >
                ⬅️ Sebelumnya
              </Button>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Halaman {togglePage} dari {totalTogglePages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={togglePage >= totalTogglePages}
                onClick={() => setTogglePage((prev) => Math.min(prev + 1, totalTogglePages))}
              >
                Selanjutnya ➡️
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Monetize Config */}
      {activeTab === "monetize" && (
        <GlassCard className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dictCms.monetizeTitle}</h3>
          {monetizeConfig ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900">
                <h4 className="font-bold text-base text-indigo-600 dark:text-indigo-400">Google Admob Config</h4>
                <Input label="Admob App ID" defaultValue={monetizeConfig.admobAppId} readOnly />
                <Input label="Admob Interstitial ID" defaultValue={monetizeConfig.admobInterstitialID?.[0]} readOnly />
              </div>
              <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900">
                <h4 className="font-bold text-base text-indigo-600 dark:text-indigo-400">Unity Ads Config</h4>
                <Input label="Unity Game ID" defaultValue={monetizeConfig.unityGameID} readOnly />
                <Input label="Unity Interstitial ID" defaultValue={monetizeConfig.unityInterstitialID?.[0]} readOnly />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Config tidak ada di folder ini.</p>
          )}
        </GlassCard>
      )}

      {/* MODAL 1: Add Music */}
      <Modal isOpen={isAddMusicOpen} onClose={() => setIsAddMusicOpen(false)} title="Tambah Track Musik Baru">
        <form onSubmit={handleCreateMusic} className="flex flex-col gap-4">
          <input type="hidden" name="selectedFolder" value={currentFolder} />
          <Input name="music_title" label="Judul Musik (misal: butter_smooth)" required placeholder="hype_boy" />
          <Input name="music_url" label="Nama File MP3 (misal: hype_boy.mp3)" required placeholder="hype_boy.mp3" />
          <Input
            name="base_url"
            label="Base Path"
            defaultValue="/kpop-s01-music-bank-remote-data-source/src/main/api/v1/music/vol/01/"
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddMusicOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan & Push Commit
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Music */}
      <Modal isOpen={!!editingMusic} onClose={() => setEditingMusic(null)} title="Ubah Track Musik">
        {editingMusic && (
          <form onSubmit={handleUpdateMusic} className="flex flex-col gap-4">
            <input type="hidden" name="selectedFolder" value={currentFolder} />
            <input type="hidden" name="obfuscatedId" value={editingMusic.obfuscatedId} />
            <Input name="music_title" label="Judul Musik" defaultValue={editingMusic.music_title} required />
            <Input name="music_url" label="Nama File MP3" defaultValue={editingMusic.music_url} required />
            <Input name="base_url" label="Base Path" defaultValue={editingMusic.base_url} required />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditingMusic(null)}>
                Batal
              </Button>
              <Button type="submit" isLoading={isPending}>
                Update & Push Commit
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: Confirm Delete Music */}
      <Modal isOpen={!!deletingMusicId} onClose={() => setDeletingMusicId(null)} title="Konfirmasi Hapus Musik">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{dictCms.confirmDeleteDesc}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeletingMusicId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              isLoading={isPending}
              onClick={() => deletingMusicId && handleDeleteMusic(deletingMusicId)}
            >
              Ya, Hapus & Push Git
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Add Toggle */}
      <Modal isOpen={isAddToggleOpen} onClose={() => setIsAddToggleOpen(false)} title="Tambah Feature Toggle">
        <form onSubmit={handleCreateToggle} className="flex flex-col gap-4">
          <input type="hidden" name="selectedFolder" value={currentFolder} />
          <Input name="key" label="Key Toggle (misal: toggle_new_ui)" required placeholder="toggle_new_ui" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status State</label>
            <select
              name="state"
              className="w-full h-11 px-4 rounded-xl border bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="true">TRUE (Aktif)</option>
              <option value="false">FALSE (Non-Aktif)</option>
            </select>
          </div>
          <Input name="value" label="Key Value String" required placeholder="true / hash_key" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddToggleOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan & Push Commit
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Edit Toggle */}
      <Modal isOpen={!!editingToggle} onClose={() => setEditingToggle(null)} title="Ubah Feature Toggle">
        {editingToggle && (
          <form onSubmit={handleUpdateToggle} className="flex flex-col gap-4">
            <input type="hidden" name="selectedFolder" value={currentFolder} />
            <input type="hidden" name="obfuscatedId" value={editingToggle.obfuscatedId} />
            <Input name="key" label="Key Toggle" defaultValue={editingToggle.key} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status State</label>
              <select
                name="state"
                defaultValue={editingToggle.state ? "true" : "false"}
                className="w-full h-11 px-4 rounded-xl border bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="true">TRUE (Aktif)</option>
                <option value="false">FALSE (Non-Aktif)</option>
              </select>
            </div>
            <Input name="value" label="Key Value String" defaultValue={editingToggle.value} required />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditingToggle(null)}>
                Batal
              </Button>
              <Button type="submit" isLoading={isPending}>
                Update & Push Commit
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 6: Confirm Delete Toggle */}
      <Modal isOpen={!!deletingToggleId} onClose={() => setDeletingToggleId(null)} title="Konfirmasi Hapus Toggle">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{dictCms.confirmDeleteDesc}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeletingToggleId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              isLoading={isPending}
              onClick={() => deletingToggleId && handleDeleteToggle(deletingToggleId)}
            >
              Ya, Hapus & Push Git
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
