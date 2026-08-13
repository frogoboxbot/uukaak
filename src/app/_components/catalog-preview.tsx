"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MusicItem, ToggleItem, MonetizeConfig, ProjectFolder } from "@/lib/lo-cms";
import { GlassCard, Badge, Input, Button } from "@/app/_components/ui-components";
import { getFolderDisplayName, resolveMd5 } from "@/lib/md5-map";

export function CatalogPreview({
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
    encryptedBadge: string;
    obfuscatedBadge: string;
  };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"music" | "toggle" | "monetize">("music");
  const [searchQuery, setSearchQuery] = useState("");
  const [musicPage, setMusicPage] = useState(1);
  const [togglePage, setTogglePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setMusicPage(1);
    setTogglePage(1);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const folder = e.target.value;
    router.push(`/?folder=${encodeURIComponent(folder)}#catalog`);
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

  // Group project folders by topFolderHash (outer project package)
  const groupedFolders = projectFolders.reduce((acc, folder) => {
    const key = folder.topFolderHash || "default";
    if (!acc[key]) acc[key] = [];
    acc[key].push(folder);
    return acc;
  }, {} as Record<string, ProjectFolder[]>);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Unified Catalog Control Header Card */}
      <GlassCard className="flex flex-col gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 text-white border border-indigo-500/30 p-5 shadow-xl rounded-2xl">
        {/* Top Row: Folder Info & Dropdown Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl font-bold shrink-0">
              📂
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base text-slate-100">
                Pilih Proyek / Folder Data
              </span>
              <span className="text-xs text-slate-400 font-mono truncate">
                Path Aktif: <code className="text-indigo-300 font-bold bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">{currentFolder ? getFolderDisplayName(currentFolder) : "(Default)"}</code>
              </span>
            </div>
          </div>

          {projectFolders.length > 0 && (
            <div className="w-full md:w-80 lg:w-96 shrink-0">
              <select
                value={currentFolder}
                onChange={handleFolderChange}
                className="w-full h-10 px-3.5 rounded-xl border border-indigo-500/50 bg-slate-900/95 text-slate-100 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-md"
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
        </div>

        {/* Bottom Row: Tab Navigation Buttons & Search Input */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950/60 rounded-xl border border-indigo-500/20">
            <button
              onClick={() => setActiveTab("music")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "music"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              🎵 {dictCms.musicTab} ({musicList.length})
            </button>
            <button
              onClick={() => setActiveTab("toggle")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "toggle"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              🎛️ {dictCms.toggleTab} ({toggleList.length})
            </button>
            <button
              onClick={() => setActiveTab("monetize")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "monetize"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              💰 {dictCms.monetizeTab}
            </button>
          </div>

          <div className="w-full sm:w-64 shrink-0">
            <Input
              placeholder="Cari data..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10 text-xs bg-slate-900/90 border-indigo-500/30 focus:border-indigo-500 text-slate-100"
            />
          </div>
        </div>
      </GlassCard>

      {/* Tab 1: Music Catalog Preview */}
      {activeTab === "music" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dictCms.musicTitle}</h3>
            <span className="text-xs text-slate-500">
              Menampilkan {filteredMusic.length === 0 ? 0 : (musicPage - 1) * itemsPerPage + 1} - {Math.min(musicPage * itemsPerPage, filteredMusic.length)} dari {filteredMusic.length} musik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedMusic.map((item) => (
              <GlassCard key={item.id} hoverEffect className="flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                      {item.music_title.replace(/_/g, " ")}
                    </span>
                    <Badge variant="purple">ID: #{item.obfuscatedId}</Badge>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                    File: {item.music_url}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Music Catalog Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Halaman {musicPage} dari {totalMusicPages}
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
        </div>
      )}

      {/* Tab 2: Feature Toggle List */}
      {activeTab === "toggle" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dictCms.toggleTitle}</h3>
            <span className="text-xs text-slate-500">
              Menampilkan {filteredToggles.length === 0 ? 0 : (togglePage - 1) * itemsPerPage + 1} - {Math.min(togglePage * itemsPerPage, filteredToggles.length)} dari {filteredToggles.length} toggle
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedToggles.map((item) => (
              <GlassCard key={item.id} hoverEffect className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.key}
                    </span>
                    <Badge variant="info">#{item.obfuscatedId}</Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
                    Val: {item.value}
                  </span>
                </div>

                <Badge variant={item.state ? "success" : "danger"}>
                  {item.state ? "ACTIVE (TRUE)" : "DISABLED (FALSE)"}
                </Badge>
              </GlassCard>
            ))}
          </div>

          {/* Toggle Catalog Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Halaman {togglePage} dari {totalTogglePages}
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
        </div>
      )}

      {/* Tab 3: Monetize Config */}
      {activeTab === "monetize" && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dictCms.monetizeTitle}</h3>
          {monetizeConfig ? (
            <GlassCard className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Admob Configuration</h4>
                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-xl flex flex-col gap-1">
                  <span>Admob App ID: {monetizeConfig.admobAppId || "(Not Set)"}</span>
                  <span>Interstitial: {monetizeConfig.admobInterstitialID?.[0] || "(None)"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Unity Ads Configuration</h4>
                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-xl flex flex-col gap-1">
                  <span>Unity Game ID: {monetizeConfig.unityGameID || "(Not Set)"}</span>
                  <span>Unity Interstitial: {monetizeConfig.unityInterstitialID?.[0] || "(None)"}</span>
                </div>
              </div>
            </GlassCard>
          ) : (
            <p className="text-sm text-slate-500">Config tidak ditemukan.</p>
          )}
        </div>
      )}
    </div>
  );
}
