import "server-only";
import fs from "fs/promises";
import path from "path";
import { encrypt } from "@/lib/crypto";
import { obfuscateId } from "@/lib/obfuscator";
import { getFolderDisplayName, parseFolderPath } from "@/lib/md5-map";

export interface MusicItem {
  id: number;
  obfuscatedId: string;
  base_url: string;
  music_title: string;
  music_url: string;
  encryptedTitle?: string;
}

export interface ToggleItem {
  id: number;
  obfuscatedId: string;
  key: string;
  state: boolean;
  value: string;
  encryptedValue?: string;
}

export interface MonetizeConfig {
  testAdmobAppId: string;
  testAdmobBanner: string;
  testAdmobInterstitial: string;
  testAdmobRewarded: string;
  admobAppId: string;
  admobBannerID: string[];
  admobInterstitialID: string[];
  admobRewardedID: string[];
  unityGameID: string;
  unityInterstitialID: string[];
  unityBannerId: string[];
  unityRewardedID: string[];
}

export interface ProjectFolder {
  id: string;
  relativePath: string;
  fullPath: string;
  name: string;
  topFolderHash: string;
  gameFolderHash: string;
  gameName: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data", "lo");

// Utility to recursively find JSON files matching target name
async function findJsonFiles(dir: string, fileName: string): Promise<string[]> {
  let results: string[] = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        const res = await findJsonFiles(fullPath, fileName);
        results = results.concat(res);
      } else if (file.name === fileName) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  return results;
}

export async function getAllProjectFolders(): Promise<ProjectFolder[]> {
  const musicFiles = await findJsonFiles(DATA_DIR, "music.json");
  const toggleFiles = await findJsonFiles(DATA_DIR, "toggle.json");
  const monetizeFiles = await findJsonFiles(DATA_DIR, "monetize-apps.json");

  const allFiles = [...musicFiles, ...toggleFiles, ...monetizeFiles];
  const folderMap = new Map<string, ProjectFolder>();

  for (const f of allFiles) {
    const dir = path.dirname(f);
    if (!folderMap.has(dir)) {
      const rel = path.relative(DATA_DIR, dir).replace(/\\/g, "/");
      const name = getFolderDisplayName(rel);
      const parsed = parseFolderPath(rel);
      folderMap.set(dir, {
        id: rel,
        relativePath: rel,
        fullPath: dir,
        name: name,
        topFolderHash: parsed.topFolderHash,
        gameFolderHash: parsed.gameFolderHash,
        gameName: parsed.gameName,
      });
    }
  }

  return Array.from(folderMap.values()).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export async function getMusicList(targetFolder?: string): Promise<{ items: MusicItem[]; filePath: string; selectedFolder: string }> {
  const folders = await getAllProjectFolders();
  let folderPath = "";

  if (targetFolder) {
    const matched = folders.find((f) => f.relativePath === targetFolder || f.fullPath === targetFolder);
    if (matched) {
      folderPath = matched.fullPath;
    }
  }

  if (!folderPath && folders.length > 0) {
    folderPath = folders[0].fullPath;
  }

  if (!folderPath) {
    return { items: [], filePath: "", selectedFolder: "" };
  }

  const filePath = path.join(folderPath, "music.json");
  const relFolder = path.relative(DATA_DIR, folderPath).replace(/\\/g, "/");

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const rawData: Array<{ base_url: string; music_title: string; music_url: string }> = JSON.parse(content);

    const items: MusicItem[] = rawData.map((item, idx) => {
      const id = idx + 1;
      const obfuscatedId = obfuscateId(id);
      const title = item.music_title || "";
      const encryptedTitle = title ? encrypt(title) : "";
      return {
        id,
        obfuscatedId,
        base_url: item.base_url || "",
        music_title: title,
        music_url: item.music_url || "",
        encryptedTitle,
      };
    });

    return { items, filePath, selectedFolder: relFolder };
  } catch {
    return { items: [], filePath, selectedFolder: relFolder };
  }
}

export async function getToggleList(targetFolder?: string): Promise<{ items: ToggleItem[]; filePath: string; selectedFolder: string }> {
  const folders = await getAllProjectFolders();
  let folderPath = "";

  if (targetFolder) {
    const matched = folders.find((f) => f.relativePath === targetFolder || f.fullPath === targetFolder);
    if (matched) {
      folderPath = matched.fullPath;
    }
  }

  if (!folderPath && folders.length > 0) {
    folderPath = folders[0].fullPath;
  }

  if (!folderPath) {
    return { items: [], filePath: "", selectedFolder: "" };
  }

  const filePath = path.join(folderPath, "toggle.json");
  const relFolder = path.relative(DATA_DIR, folderPath).replace(/\\/g, "/");

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const rawData: Array<{ key: string; state: boolean; value: string }> = JSON.parse(content);

    const items: ToggleItem[] = rawData.map((item, idx) => {
      const id = idx + 1;
      const obfuscatedId = obfuscateId(id);
      const val = item.value || "";
      const encryptedValue = val ? encrypt(val) : "";
      return {
        id,
        obfuscatedId,
        key: item.key || "",
        state: Boolean(item.state),
        value: val,
        encryptedValue,
      };
    });

    return { items, filePath, selectedFolder: relFolder };
  } catch {
    return { items: [], filePath, selectedFolder: relFolder };
  }
}

export async function getMonetizeConfig(targetFolder?: string): Promise<{ config: MonetizeConfig | null; filePath: string; selectedFolder: string }> {
  const folders = await getAllProjectFolders();
  let folderPath = "";

  if (targetFolder) {
    const matched = folders.find((f) => f.relativePath === targetFolder || f.fullPath === targetFolder);
    if (matched) {
      folderPath = matched.fullPath;
    }
  }

  if (!folderPath && folders.length > 0) {
    folderPath = folders[0].fullPath;
  }

  if (!folderPath) {
    return { config: null, filePath: "", selectedFolder: "" };
  }

  const filePath = path.join(folderPath, "monetize-apps.json");
  const relFolder = path.relative(DATA_DIR, folderPath).replace(/\\/g, "/");

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const config: MonetizeConfig = JSON.parse(content);
    return { config, filePath, selectedFolder: relFolder };
  } catch {
    return { config: null, filePath, selectedFolder: relFolder };
  }
}

export async function saveMusicList(filePath: string, items: Array<{ base_url: string; music_title: string; music_url: string }>): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(items, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save music.json:", err);
    return false;
  }
}

export async function saveToggleList(filePath: string, items: Array<{ key: string; state: boolean; value: string }>): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(items, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save toggle.json:", err);
    return false;
  }
}

export async function saveMonetizeConfig(filePath: string, config: MonetizeConfig): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(config, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save monetize-apps.json:", err);
    return false;
  }
}
