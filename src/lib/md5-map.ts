export const KNOWN_MD5_MAP: Record<string, string> = {
  // Top-level Package / Project Hashes
  "6435a81a05f577fbc6298f1e3ba1c108": "tiktok-s01-piano-bundle",
  "65dc4fe83675577ded5cbecc6dbdc400": "pop-s01-piano-bundle",
  "7d9d07ba5b4a2220773cdebcd765082b": "brainrot-mix-piano-bundle",
  "bc9f3bd7783d2275bf97546d9df57fc3": "anime-s01-piano-bundle",
  "d910b3569482ca30c794ebabe4866586": "rhythm-s01-piano-bundle",
  "f470eb472a2ad06fb0a7d4c4948da092": "kpop-cat-piano-bundle",

  // Intermediate subdirectories
  "8a5da52ed126447d359e70c05721a8aa": "api",
  "6654c734ccab8f440ff0825eb443dc7f": "v1",
  "d2a57dc1d883fd21fb9951699df71cc7": "app",

  // Game / App directory hashes
  "4c8b432bbf113014ec49b98d15156e2c": "piano-tiles",
  "7037fe361a7130ab67540482fe58885a": "anime-hunter-piano-tiles",
  "09e50ec195dd3fd05138b32fe29b7eb8": "ballerina-cappuccina-game-piano",
  "366bfbf90e82cf564eb3eba794f6d62d": "music-tiles-7-magic-piano-game",
  "59e28fd0c45dba75e11ce8e6519705d7": "piano-tiles-dangdut-farel-23",
  "15f66e6e400a3c09cfb91c6c891f9756": "sugar-brownie-piano-tiles",
  "02988be92833801886e50850128d1dc9": "meow-cat-piano-tiles",
  "782269cb034e1e3a5a8ed1433b640a0b": "demon-rhythm-anime-piano-tiles",
  "6609f859852f8acf7b658e133ddceade": "hunter-x-hunter-piano-tiles",
  "f37601a9ac090b6eeba059a2debe1e31": "piano-tiles-brr-brr-patapim",
  "11d6c4005c885178125bcfa179f246ae": "piano-tung-tung-tung-sahur",
  "3eb91b5e25b9127671a69d4bce389c2c": "kpop-demon-piano-tiles",
  "2496fba52f34faca93855b2e5a5f71df": "piano-tiles-anime-basketball",
  "799d233d899dd3833b81a3c0f6e3e65a": "piano-tung-3x-sahur",
  "24f7bfb1a7c45c614c7f5ae59a5b8a2d": "black-clover-piano-quest",
  "1c4d7ba1ea60b0088c1e9dbd6de6db31": "bombardino-crocodilo-brainrot-piano",
  "d70cc803a00eed25eb5db834cf2e2dc2": "mj-piano-tiles-game",
  "87ad5fd5e6ef62cb040eac4426f2014b": "piano-tiles-maher-zains",
  "17be2c38d861358df84626a62529bd9c": "tralalero-tralala-brainrot-piano",
  "78745efb0a0d03b280e67609d0fbd7c4": "special-edition-piano-tiles",
};

/**
 * Dynamically registers an MD5 hash mapping in memory.
 */
export function registerMd5MappingInMemory(hash: string, plaintext: string) {
  const cleanHash = hash.trim().toLowerCase();
  const cleanName = plaintext.trim();
  if (cleanHash && cleanName) {
    KNOWN_MD5_MAP[cleanHash] = cleanName;
  }
}

/**
 * Resolves an MD5 hash string to its human-readable plaintext name if available.
 */
export function resolveMd5(hash: string): string {
  const cleanHash = hash.trim().toLowerCase();
  return KNOWN_MD5_MAP[cleanHash] || hash;
}

/**
 * Parses path parts into top project hash and game name.
 */
export function parseFolderPath(relativePath: string) {
  const parts = relativePath.split("/").map((p) => p.trim()).filter(Boolean);
  const topFolderHash = parts[0] || relativePath;
  const gameFolderHash = parts[parts.length - 1] || relativePath;
  const topFolderName = resolveMd5(topFolderHash);
  const gameName = resolveMd5(gameFolderHash);

  return {
    topFolderHash,
    topFolderName,
    gameFolderHash,
    gameName,
  };
}

/**
 * Formats a relative path into a clear label showcasing the Top Project Folder first.
 */
export function getFolderDisplayName(relativePath: string): string {
  const { topFolderHash, topFolderName, gameFolderHash, gameName } = parseFolderPath(relativePath);
  const isTopDecrypted = topFolderName !== topFolderHash;
  const isGameDecrypted = gameName !== gameFolderHash;

  const topLabel = isTopDecrypted ? topFolderName : topFolderHash.slice(0, 8);
  const gameLabel = isGameDecrypted ? gameName : gameFolderHash.slice(0, 8);

  return `📦 [${topLabel}] 🎮 ${gameLabel}`;
}

