import { createClient, SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import type { GuessRecord, GuessStore } from "./types.js";

function rowToRecord(row: {
  device_id: string;
  day_index: number;
  date: string;
  question_id: number;
  low: number;
  high: number;
  confidence: number;
  score: number;
  hit: boolean;
  submitted_at: string;
}): GuessRecord {
  return {
    deviceId: row.device_id,
    dayIndex: row.day_index,
    date: row.date,
    questionId: row.question_id,
    low: row.low,
    high: row.high,
    confidence: row.confidence,
    score: row.score,
    hit: row.hit,
    submittedAt: row.submitted_at,
  };
}

export function createSupabaseStore(
  url: string,
  serviceRoleKey: string,
): GuessStore {
  const supabase: SupabaseClient = createClient(url, serviceRoleKey, {
    realtime: { transport: ws as unknown as typeof WebSocket },
  });

  return {
    async findByDeviceAndDay(deviceId, dayIndex) {
      const { data, error } = await supabase
        .from("guesses")
        .select("*")
        .eq("device_id", deviceId)
        .eq("day_index", dayIndex)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data ? rowToRecord(data) : null;
    },

    async findByDevice(deviceId) {
      const { data, error } = await supabase
        .from("guesses")
        .select("*")
        .eq("device_id", deviceId)
        .order("day_index", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map(rowToRecord);
    },

    async insert(record) {
      const { error } = await supabase.from("guesses").insert({
        device_id: record.deviceId,
        day_index: record.dayIndex,
        date: record.date,
        question_id: record.questionId,
        low: record.low,
        high: record.high,
        confidence: record.confidence,
        score: record.score,
        hit: record.hit,
        submitted_at: record.submittedAt,
      });

      if (error) throw new Error(error.message);
    },

    async trackEvent(eventType, deviceId, metadata = {}) {
      const { error } = await supabase.from("events").insert({
        event_type: eventType,
        device_id: deviceId ?? null,
        metadata,
      });

      if (error) console.error("Event track failed:", error.message);
    },
  };
}
