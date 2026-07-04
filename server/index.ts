import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const questions = JSON.parse(
  readFileSync(join(__dirname, "data", "questions.json"), "utf-8"),
);

const app = createApp();

app.listen(config.port, () => {
  console.log(`Rangewise running on port ${config.port}`);
  console.log(`Launch date: ${config.launchDate.toISOString()}`);
  console.log(`Question bank: ${questions.length} days`);
});
