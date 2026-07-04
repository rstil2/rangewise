import { createFileStore } from "./fileStore.js";
import { createSupabaseStore } from "./supabaseStore.js";
import type { GuessStore } from "./types.js";

export function createStore(): GuessStore {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    console.log("Using Supabase database");
    return createSupabaseStore(url, key);
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "WARNING: No Supabase credentials in production — using file store (data will not persist across deploys)",
    );
  } else {
    console.log("Using local file store (dev mode)");
  }

  return createFileStore();
}

export type { GuessRecord, GuessStore } from "./types.js";
