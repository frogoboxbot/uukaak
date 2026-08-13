"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdminPassword, createAdminSession, deleteAdminSession, isAdminAuthenticated } from "@/lib/admin-auth";
import { getMusicList, saveMusicList, getToggleList, saveToggleList } from "@/lib/lo-cms";
import { pushJsonCommit } from "@/lib/github-sync";
import { deobfuscateId } from "@/lib/obfuscator";

export async function loginAdminAction(prevState: { error?: string } | null, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password) {
    return { error: "Kata sandi tidak boleh kosong." };
  }

  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    return { error: "Kata sandi admin tidak sah!" };
  }

  await createAdminSession();
  redirect("/admin/dashboard");
}

export async function logoutAdminAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export async function createMusicAction(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) throw new Error("Unauthorized");

  const music_title = (formData.get("music_title") as string) || "";
  const music_url = (formData.get("music_url") as string) || "";
  const base_url = (formData.get("base_url") as string) || "/kpop-s01-music-bank-remote-data-source/src/main/api/v1/music/vol/01/";
  const selectedFolder = (formData.get("selectedFolder") as string) || undefined;

  if (!music_title || !music_url) {
    return { success: false, message: "Judul dan URL musik wajib diisi." };
  }

  const { items, filePath } = await getMusicList(selectedFolder);
  if (!filePath) return { success: false, message: "File music.json tidak ditemukan." };

  const rawItems = items.map((i) => ({
    base_url: i.base_url,
    music_title: i.music_title,
    music_url: i.music_url,
  }));

  rawItems.unshift({ base_url, music_title, music_url });
  const saved = await saveMusicList(filePath, rawItems);

  if (saved) {
    const commit = await pushJsonCommit("music.json", "CREATE", music_title);
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, message: `Berhasil menambahkan musik ke ${selectedFolder || 'proyek'}! Commit Hash: ${commit.commitHash}` };
  }

  return { success: false, message: "Gagal menyimpan ke file JSON." };
}

export async function updateMusicAction(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) throw new Error("Unauthorized");

  const obfuscatedId = formData.get("obfuscatedId") as string;
  const music_title = formData.get("music_title") as string;
  const music_url = formData.get("music_url") as string;
  const base_url = formData.get("base_url") as string;
  const selectedFolder = (formData.get("selectedFolder") as string) || undefined;

  const id = deobfuscateId(obfuscatedId);
  if (!id) return { success: false, message: "ID tidak valid." };

  const { items, filePath } = await getMusicList(selectedFolder);
  if (!filePath) return { success: false, message: "File music.json tidak ditemukan." };

  const idx = id - 1;
  if (idx < 0 || idx >= items.length) return { success: false, message: "Index record tidak ditemukan." };

  items[idx].music_title = music_title;
  items[idx].music_url = music_url;
  items[idx].base_url = base_url;

  const rawItems = items.map((i) => ({
    base_url: i.base_url,
    music_title: i.music_title,
    music_url: i.music_url,
  }));

  const saved = await saveMusicList(filePath, rawItems);
  if (saved) {
    const commit = await pushJsonCommit("music.json", "UPDATE", music_title);
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, message: `Berhasil memperbarui musik! Commit Hash: ${commit.commitHash}` };
  }

  return { success: false, message: "Gagal menyimpan ke file JSON." };
}

export async function deleteMusicAction(obfuscatedId: string, selectedFolder?: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, message: "Unauthorized" };

  const id = deobfuscateId(obfuscatedId);
  if (!id) return { success: false, message: "ID tidak valid." };

  const { items, filePath } = await getMusicList(selectedFolder);
  if (!filePath) return { success: false, message: "File music.json tidak ditemukan." };

  const idx = id - 1;
  if (idx < 0 || idx >= items.length) return { success: false, message: "Record tidak ditemukan." };

  const deletedTitle = items[idx].music_title;
  items.splice(idx, 1);

  const rawItems = items.map((i) => ({
    base_url: i.base_url,
    music_title: i.music_title,
    music_url: i.music_url,
  }));

  const saved = await saveMusicList(filePath, rawItems);
  if (saved) {
    const commit = await pushJsonCommit("music.json", "DELETE", deletedTitle);
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, message: `Berhasil menghapus musik! Commit Hash: ${commit.commitHash}` };
  }

  return { success: false, message: "Gagal menyimpan file JSON." };
}

export async function createToggleAction(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) throw new Error("Unauthorized");

  const key = formData.get("key") as string;
  const state = formData.get("state") === "true";
  const value = formData.get("value") as string;
  const selectedFolder = (formData.get("selectedFolder") as string) || undefined;

  if (!key) return { success: false, message: "Key wajib diisi." };

  const { items, filePath } = await getToggleList(selectedFolder);
  if (!filePath) return { success: false, message: "File toggle.json tidak ditemukan." };

  const rawItems = items.map((i) => ({ key: i.key, state: i.state, value: i.value }));
  rawItems.unshift({ key, state, value });

  const saved = await saveToggleList(filePath, rawItems);
  if (saved) {
    const commit = await pushJsonCommit("toggle.json", "CREATE", key);
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, message: `Berhasil menambahkan toggle! Commit Hash: ${commit.commitHash}` };
  }

  return { success: false, message: "Gagal menyimpan file JSON." };
}

export async function updateToggleAction(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) throw new Error("Unauthorized");

  const obfuscatedId = formData.get("obfuscatedId") as string;
  const key = formData.get("key") as string;
  const state = formData.get("state") === "true";
  const value = formData.get("value") as string;
  const selectedFolder = (formData.get("selectedFolder") as string) || undefined;

  const id = deobfuscateId(obfuscatedId);
  if (!id) return { success: false, message: "ID tidak valid." };

  const { items, filePath } = await getToggleList(selectedFolder);
  if (!filePath) return { success: false, message: "File toggle.json tidak ditemukan." };

  const idx = id - 1;
  if (idx < 0 || idx >= items.length) return { success: false, message: "Record tidak ditemukan." };

  items[idx].key = key;
  items[idx].state = state;
  items[idx].value = value;

  const rawItems = items.map((i) => ({ key: i.key, state: i.state, value: i.value }));
  const saved = await saveToggleList(filePath, rawItems);

  if (saved) {
    const commit = await pushJsonCommit("toggle.json", "UPDATE", key);
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, message: `Berhasil memperbarui toggle! Commit Hash: ${commit.commitHash}` };
  }

  return { success: false, message: "Gagal memperbarui file JSON." };
}

export async function deleteToggleAction(obfuscatedId: string, selectedFolder?: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, message: "Unauthorized" };

  const id = deobfuscateId(obfuscatedId);
  if (!id) return { success: false, message: "ID tidak valid." };

  const { items, filePath } = await getToggleList(selectedFolder);
  if (!filePath) return { success: false, message: "File toggle.json tidak ditemukan." };

  const idx = id - 1;
  if (idx < 0 || idx >= items.length) return { success: false, message: "Record tidak ditemukan." };

  const deletedKey = items[idx].key;
  items.splice(idx, 1);

  const rawItems = items.map((i) => ({ key: i.key, state: i.state, value: i.value }));
  const saved = await saveToggleList(filePath, rawItems);

  if (saved) {
    const commit = await pushJsonCommit("toggle.json", "DELETE", deletedKey);
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, message: `Berhasil menghapus toggle! Commit Hash: ${commit.commitHash}` };
  }

  return { success: false, message: "Gagal menghapus dari file JSON." };
}
