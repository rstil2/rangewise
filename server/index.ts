import "dotenv/config";
import express from "express";
import cors from "cors";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { computeScore, computeCalibration } from "./scoring.js";
import { createStore, type GuessRecord } from "./db/index.js";
import { config } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(__dirname, "data");
const DIST_DIR = join(ROOT_DIR, "dist");

interface Question {
  id: number;
  prompt: string;
  trueValue: number;
  referenceWidth: number;
  sliderMin?: number;
  sliderMax?: number;
  source: string;
  domain: string;
  difficulty: string;
}

const questions: Question[] = JSON.parse(
  readFileSync(join(DATA_DIR, "questions.json"), "utf-8"),
);

const store = createStore();

function getDayIndex(date = new Date()): number {
  const ms = date.getTime() - config.launchDate.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function getQuestionForDay(dayIndex: number): Question {
  if (dayIndex >= questions.length) {
    console.warn(
      `Day index ${dayIndex} exceeds question bank (${questions.length}) — content will repeat`,
    );
  }
  return questions[dayIndex % questions.length];
}

function formatDate(dayIndex: number): string {
  const d = new Date(config.launchDate);
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().slice(0, 10);
}

function computeStreak(guesses: GuessRecord[]): number {
  const byDay = new Map<number, GuessRecord>();
  for (const g of guesses) {
    byDay.set(g.dayIndex, g);
  }
  let streak = 0;
  const today = getDayIndex();
  for (let d = today; d >= 0; d--) {
    if (byDay.has(d)) streak++;
    else break;
  }
  return streak;
}

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
  }),
);
app.use(express.json({ limit: "16kb" }));

app.get("/api/question/today", (_req, res) => {
  const dayIndex = getDayIndex();
  const q = getQuestionForDay(dayIndex);
  const span = q.referenceWidth * 4;
  const sliderMin = q.sliderMin ?? Math.max(0, q.trueValue - span);
  const sliderMax = q.sliderMax ?? q.trueValue + span;
  const mid = (sliderMin + sliderMax) / 2;

  res.json({
    id: q.id,
    prompt: q.prompt,
    referenceWidth: q.referenceWidth,
    sliderMin,
    sliderMax,
    defaultLow: mid - q.referenceWidth * 0.5,
    defaultHigh: mid + q.referenceWidth * 0.5,
    domain: q.domain,
    difficulty: q.difficulty,
    dayIndex,
    date: formatDate(dayIndex),
    questionBankSize: questions.length,
  });
});

app.get("/api/guess/today/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const dayIndex = getDayIndex();
    const q = getQuestionForDay(dayIndex);
    const existing = await store.findByDeviceAndDay(deviceId, dayIndex);

    if (!existing) {
      res.json({ played: false });
      return;
    }

    res.json({
      played: true,
      low: existing.low,
      high: existing.high,
      confidence: existing.confidence,
      score: existing.score,
      hit: existing.hit,
      trueValue: q.trueValue,
      source: q.source,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load guess" });
  }
});

app.post("/api/guess", async (req, res) => {
  try {
    const { deviceId, dayIndex, low, high, confidence } = req.body;

    if (
      !deviceId ||
      dayIndex === undefined ||
      low === undefined ||
      high === undefined ||
      !confidence
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (typeof deviceId !== "string" || deviceId.length > 128) {
      res.status(400).json({ error: "Invalid device ID" });
      return;
    }

    if (low >= high) {
      res.status(400).json({ error: "Low must be less than high" });
      return;
    }

    const todayIndex = getDayIndex();
    if (dayIndex !== todayIndex) {
      res.status(400).json({ error: "Can only submit guess for today's question" });
      return;
    }

    const q = getQuestionForDay(dayIndex);
    const existing = await store.findByDeviceAndDay(deviceId, dayIndex);

    if (existing) {
      res.json({
        score: existing.score,
        hit: existing.hit,
        trueValue: q.trueValue,
        source: q.source,
        distanceOutside: 0,
        alreadySubmitted: true,
      });
      return;
    }

    const result = computeScore({
      low,
      high,
      trueValue: q.trueValue,
      referenceWidth: q.referenceWidth,
    });

    const record: GuessRecord = {
      deviceId,
      dayIndex,
      date: formatDate(dayIndex),
      questionId: q.id,
      low,
      high,
      confidence,
      score: result.score,
      hit: result.hit,
      submittedAt: new Date().toISOString(),
    };

    await store.insert(record);
    await store.trackEvent("game_complete", deviceId, {
      score: result.score,
      hit: result.hit,
      confidence,
      dayIndex,
    });

    res.json({
      score: result.score,
      hit: result.hit,
      trueValue: q.trueValue,
      source: q.source,
      distanceOutside: result.distanceOutside,
      alreadySubmitted: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit guess" });
  }
});

app.get("/api/stats/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const guesses = (await store.findByDevice(deviceId)).sort(
      (a, b) => b.dayIndex - a.dayIndex,
    );

    const totalPlayed = guesses.length;
    const averageScore =
      totalPlayed > 0
        ? guesses.reduce((s, g) => s + g.score, 0) / totalPlayed
        : 0;

    const calibration = computeCalibration(
      guesses.map((g) => ({ confidence: g.confidence, hit: g.hit })),
    );

    res.json({
      totalPlayed,
      averageScore: Math.round(averageScore),
      currentStreak: computeStreak(guesses),
      calibration,
      recentGames: guesses.slice(0, 30).map((g) => ({
        date: g.date,
        score: Math.round(g.score),
        hit: g.hit,
        confidence: g.confidence,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const { eventType, deviceId, metadata } = req.body;
    if (!eventType || typeof eventType !== "string") {
      res.status(400).json({ error: "eventType required" });
      return;
    }
    await store.trackEvent(eventType, deviceId, metadata ?? {});
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to track event" });
  }
});

app.get("/api/health", async (_req, res) => {
  res.json({
    ok: true,
    dayIndex: getDayIndex(),
    questionBankSize: questions.length,
    database: process.env.SUPABASE_URL ? "supabase" : "file",
    launchDate: config.launchDate.toISOString(),
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { maxAge: config.isProduction ? "1d" : 0 }));
  app.use((_req, res) => {
    res.sendFile(join(DIST_DIR, "index.html"));
  });
}

app.listen(config.port, () => {
  console.log(`Rangewise running on port ${config.port}`);
  console.log(`Launch date: ${config.launchDate.toISOString()}`);
  console.log(`Question bank: ${questions.length} days`);
});
