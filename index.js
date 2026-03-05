import dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import { handleStart } from "./modules/start.js";
import { handleDistrict } from "./modules/district.js";
import applyModule from "./modules/apply.js";
import { handleAdmin } from "./modules/admin.js";

// TOKENNI bevosita .env dan olamiz
const bot = new Telegraf(process.env.BOT_TOKEN);

// =============================
// ID KO‘RISH
// =============================
bot.command("id", async (ctx) => {
  await ctx.reply(
    `📌 Chat turi: ${ctx.chat.type}\n🆔 Chat ID: ${ctx.chat.id}\n👤 Sizning ID: ${ctx.from.id}`
  );
});

// =============================
// MODULLAR
// =============================
handleStart(bot);
applyModule(bot);
handleAdmin(bot);
handleDistrict(bot);

// =============================
// BOTNI ISHGA TUSHIRISH
// =============================
bot.launch().then(() => {
  console.log("Bot ishga tushdi ✅");
  console.log("ADMIN_IDS:", process.env.ADMIN_IDS);
});

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));