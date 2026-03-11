import dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";

import { handleStart } from "./modules/start.js";
import { handleDistrict } from "./modules/district.js";
import applyModule from "./modules/apply.js";
import { handleAdmin } from "./modules/admin.js";

// =============================
// TOKEN TEKSHIRISH
// =============================

const token = process.env.BOT_TOKEN;

if (!token) {
console.error("❌ BOT_TOKEN topilmadi (.env faylni tekshiring)");
process.exit(1);
}

// =============================
// BOT YARATISH
// =============================

const bot = new Telegraf(token);

// =============================
// LOGGER (debug uchun)
// =============================

bot.use(async (ctx, next) => {
try {
await next();
} catch (err) {
console.error("❌ Bot xatosi:", err);
}
});

// =============================
// CHAT ID KO‘RISH
// =============================

bot.command("id", async (ctx) => {

const text =
`📌 Chat turi: ${ctx.chat.type}
🆔 Chat ID: ${ctx.chat.id}
👤 Sizning ID: ${ctx.from.id}`;

await ctx.reply(text);

});

// =============================
// MODULLARNI ULASH
// =============================

handleStart(bot);
handleDistrict(bot);
applyModule(bot);
handleAdmin(bot);

// =============================
// BOTNI ISHGA TUSHIRISH
// =============================

async function startBot() {

try {

```
await bot.launch();

console.log("🤖 Bot muvaffaqiyatli ishga tushdi");
console.log("👮 Adminlar:", process.env.ADMIN_IDS || "yo‘q");
```

} catch (err) {

```
console.error("❌ Bot ishga tushmadi:", err);
```

}

}

startBot();

// =============================
// GLOBAL XATOLIK
// =============================

process.on("unhandledRejection", (err) => {
console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
console.error("❌ Uncaught Exception:", err);
});

// =============================
// GRACEFUL STOP
// =============================

process.once("SIGINT", () => {
console.log("⛔ Bot to‘xtatildi (SIGINT)");
bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
console.log("⛔ Bot to‘xtatildi (SIGTERM)");
bot.stop("SIGTERM");
});

// =============================
// BOT HOLATI
// =============================

setInterval(() => {
console.log("⚡ Bot ishlayapti...");
}, 60000);
