import { Markup } from "telegraf";
import { readUsers, saveUsers } from "./storage.js";

// ================= ROLE =================
const SUPER_ADMINS = (process.env.SUPER_ADMIN_IDS || "")
  .split(",")
  .filter(Boolean)
  .map(Number);

function isAdmin(id) {
  return SUPER_ADMINS.includes(id);
}

// broadcast holati
const broadcastMode = new Set();

export function handleAdmin(bot) {

  // ================= ADMIN PANEL =================
  bot.action("OPEN_ADMIN_PANEL", async (ctx) => {

    await ctx.answerCbQuery();

    if (!isAdmin(ctx.from.id)) {
      return ctx.reply("❌ Siz admin emassiz");
    }

    await ctx.reply(
`👑 <b>ADMIN PANEL</b>

Kerakli bo‘limni tanlang:`,
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback("📊 Statistika", "ADMIN_STATS"),
            Markup.button.callback("📨 Murojaatlar", "ADMIN_REQUESTS")
          ],
          [
            Markup.button.callback("📢 Broadcast", "ADMIN_BROADCAST")
          ]
        ])
      }
    );

  });


  // ================= STATISTIKA =================
  bot.action("ADMIN_STATS", async (ctx) => {

    if (!isAdmin(ctx.from.id)) return;

    const users = await readUsers();

    const today = new Date().toDateString();

    const total = users.length;

    const todayCount = users.filter(u =>
      u.lastRequestDate &&
      new Date(u.lastRequestDate).toDateString() === today
    ).length;

    await ctx.answerCbQuery();

    await ctx.reply(
`📊 <b>BOT STATISTIKASI</b>

👥 Jami foydalanuvchilar: <b>${total}</b>
📅 Bugungi murojaatlar: <b>${todayCount}</b>`,
      { parse_mode: "HTML" }
    );

  });


  // ================= OXIRGI MUROJAATLAR =================
  bot.action("ADMIN_REQUESTS", async (ctx) => {

    if (!isAdmin(ctx.from.id)) return;

    const users = await readUsers();

    const sorted = users
      .filter(u => u.lastRequestDate)
      .sort((a, b) =>
        new Date(b.lastRequestDate) - new Date(a.lastRequestDate)
      )
      .slice(0, 10);

    if (sorted.length === 0) {
      return ctx.reply("❌ Murojaatlar topilmadi");
    }

    let text = "📨 <b>OXIRGI MUROJAATLAR</b>\n\n";

    sorted.forEach((u, i) => {

      const name = u.firstName || "Foydalanuvchi";
      const username = u.username ? `@${u.username}` : "username yo‘q";
      const district = u.district?.name || "Noma’lum";

      text += `${i + 1}. 👤 ${name}
🔗 ${username}
📍 ${district}
🕒 ${new Date(u.lastRequestDate).toLocaleString("uz-UZ")}

`;
    });

    await ctx.answerCbQuery();

    await ctx.reply(text, { parse_mode: "HTML" });

  });


  // ================= BROADCAST BOSISH =================
  bot.action("ADMIN_BROADCAST", async (ctx) => {

    if (!isAdmin(ctx.from.id)) return;

    broadcastMode.add(ctx.from.id);

    await ctx.answerCbQuery();

    await ctx.reply(
`📢 Broadcast rejimi yoqildi

Yuboriladigan xabarni yuboring
(matn / rasm / video / fayl)`
    );

  });


  // ================= BROADCAST YUBORISH =================
  bot.on("message", async (ctx) => {

    if (!broadcastMode.has(ctx.from.id)) return;
    if (!isAdmin(ctx.from.id)) return;

    broadcastMode.delete(ctx.from.id);

    const users = await readUsers();

    let success = 0;
    let failed = 0;

    const aliveUsers = [];

    for (const user of users) {

      try {

        // eng yaxshi usul
        await ctx.telegram.copyMessage(
          user.id,
          ctx.chat.id,
          ctx.message.message_id
        );

        success++;
        aliveUsers.push(user);

      } catch (err) {

        failed++;

        if (err.response?.error_code === 403) {
          console.log("Bot blok qilingan:", user.id);
        } else {
          aliveUsers.push(user);
        }

      }

    }

    // blok qilganlarni o‘chiramiz
    await saveUsers(aliveUsers);

    await ctx.reply(
`✅ <b>Broadcast yakunlandi</b>

📨 Yuborildi: <b>${success}</b>
❌ Yetib bormadi: <b>${failed}</b>`,
      { parse_mode: "HTML" }
    );

  });

}