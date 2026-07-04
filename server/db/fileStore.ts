import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { GuessRecord, GuessStore } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GUESSES_FILE = join(__dirname, "data", "guesses.json");

export function createFileStore(): GuessStore {
  function load(): GuessRecord[] {
    if (!existsSync(GUESSES_FILE)) return [];
    return JSON.parse(readFileSync(GUESSES_FILE, "utf-8"));
  }

  function save(guesses: GuessRecord[]) {
    const dir = dirname(GUESSES_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(GUESSES_FILE, JSON.stringify(guesses, null, 2));
  }

  return {
    async findByDeviceAndDay(deviceId, dayIndex) {
      return (
        load().find(
          (g) => g.deviceId === deviceId && g.dayIndex === dayIndex,
        ) ?? null
      );
    },

    async findByDevice(deviceId) {
      return load().filter((g) => g.deviceId === deviceId);
    },

    async insert(record) {
      const guesses = load();
      guesses.push(record);
      save(guesses);
    },

    async trackEvent() {
      // no-op for local file store
    },
  };
}
