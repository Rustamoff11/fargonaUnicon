import { Markup } from "telegraf";
import fs from "fs";
import path from "path";
import { saveUser, getUser, readUsers } from "./storage.js";
import { DISTRICTS } from "../config.js";

// employees.json o‘qish
const employeesPath = path.resolve("data/employees.json");
let employees = {};
try {
  const data = fs.readFileSync(employeesPath, "utf8");
  employees = JSON.parse(data);
} catch (err) {
  console.log("❌ employees.json topilmadi");
}

// managers.json o‘qish
const managersPath = path.resolve("data/managers.json");
let managers = {};
try {
  const data = fs.readFileSync(managersPath, "utf8");
  managers = JSON.parse(data);
} catch (err) {
  console.log("❌ managers.json topilmadi");
}

export default function applyModule(bot) {

  // =============================
  // Tuman tanlash (hodimlar ro‘yxati)
  // =============================
  bot.action(/APPLY_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();

    const districtName = ctx.match[1];
    const district = DISTRICTS.find(d => d.name === districtName);
    if (!district) return ctx.reply("❌ Hudud topilmadi");

    const districtEmployees = employees[districtName] || [];
    const manager = managers[districtName] || "@user";

    let text = `🏢 <b>${districtName} tumani hodimlari</b>\n\n`;
    text += `👨‍💼 Mas'ul hodim: ${manager}\n\n━━━━━━━━━━━━━━\n\n`;

    if (!districtEmployees.length) {
      text += "❌ Hodimlar topilmadi\n";
    } else {
      districtEmployees.forEach(emp => {
        text += `👤 <b>${emp.ism} ${emp.familiya}</b>\n`;
        text += `📞 ${emp.tel}\n\n`;
      });
    }

    text += "━━━━━━━━━━━━━━\n✍️ Murojaat yuborish uchun tugmani bosing";

    await saveUser(ctx.from.id, { district: district, active: false });

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("✍️ Murojaat yuborish", `START_REQUEST_${districtName}`)],
      [Markup.button.callback("⬅️ Orqaga", "BACK_TO_DISTRICTS")],
      [Markup.button.callback("❌ Close", "CLOSE_PANEL")]
    ]);

    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
  });

  // =============================
  // Murojaat boshlash
  // =============================
  bot.action(/START_REQUEST_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();

    const districtName = ctx.match[1];
    const district = DISTRICTS.find(d => d.name === districtName);
    if (!district) return ctx.reply("❌ Hudud topilmadi");

    await saveUser(ctx.from.id, { active: true, district: district });

    const now = new Date();
    const formattedTime = now.toLocaleString("uz-UZ", { hour12: false });

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Orqaga", "BACK_TO_DISTRICTS")],
      [Markup.button.callback("❌ Close", "CLOSE_PANEL")]
    ]);

    await ctx.reply(`✍️ Murojaatingizni yozing:\n⏰ Vaqt: ${formattedTime}`, { reply_markup: keyboard });
  });

  // =============================
  // Suhbatni tugatish
  // =============================
  bot.action("END_CHAT", async (ctx) => {
    await ctx.answerCbQuery();
    await saveUser(ctx.from.id, { active: false });
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply("🔚 Suhbat tugatildi.\n/start bilan qayta boshlang.");
  });

  // =============================
  // Close panel
  // =============================
  bot.action("CLOSE_PANEL", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
  });

  // =============================
  // Back to districts
  // =============================
  bot.action("BACK_TO_DISTRICTS", async (ctx) => {
    await ctx.answerCbQuery();

    const buttons = DISTRICTS.map(d =>
      Markup.button.callback(d.name, `DISTRICT_${d.name}`)
    );
    const keyboard = Markup.inlineKeyboard(buttons, { columns: 3 });

    await ctx.editMessageText("📍 Hududingizni tanlang:", { reply_markup: keyboard });
  });

  // =============================
  // User xabarlarini qabul qilish
  // =============================
  bot.on("message", async (ctx) => {
    if (ctx.message.text?.startsWith("/")) return;

    if (ctx.chat.type === "private") {
      const user = await getUser(ctx.from.id);
      if (!user || !user.active) return;

      if (!user.district || !user.district.groupId) {
        console.log("❌ groupId topilmadi");
        return ctx.reply("❌ Guruh sozlanmagan.");
      }

      const now = new Date();
      const username = ctx.from.username
        ? `@${ctx.from.username}`
        : `<a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>`;
      const manager = managers[user.district.name] || "@user";

      const header = `📩 <b>YANGI MUROJAAT</b>

👤 ${username}
📞 ${user.phone || "Kiritilmagan"}
📍 ${user.district.name}

👨‍💼 Mas'ul hodim: ${manager}

📅 ${now.toLocaleDateString("uz-UZ")}
⏰ ${now.toLocaleTimeString("uz-UZ")}`;

      try {
        let sentMessage;
        if (ctx.message.text) {
          sentMessage = await ctx.telegram.sendMessage(
            user.district.groupId,
            `${header}\n\n📝 ${ctx.message.text}`,
            { parse_mode: "HTML" }
          );
        }
        if (ctx.message.photo) {
          sentMessage = await ctx.telegram.sendPhoto(
            user.district.groupId,
            ctx.message.photo.pop().file_id,
            { caption: header, parse_mode: "HTML" }
          );
        }

        if (!sentMessage) return;

        await saveUser(ctx.from.id, {
          lastMessageId: sentMessage.message_id,
          lastRequestDate: now.toISOString()
        });

        await ctx.reply(
          "✅ Murojaat yuborildi",
          Markup.inlineKeyboard([
            [Markup.button.callback("🛑 Suhbatni tugatish", "END_CHAT")]
          ])
        );
      } catch (err) {
        console.log("❌ Guruhga yuborishda xato:", err.message);
        await ctx.reply("❌ Xabar yuborilmadi.\nBot guruhda admin ekanini tekshiring.");
      }

      return;
    }

    // ================= GROUP JAVOB =================
    if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
      if (!ctx.message.reply_to_message) return;

      const replyId = ctx.message.reply_to_message.message_id;
      const users = await readUsers();
      const user = users.find(u => u.lastMessageId === replyId);
      if (!user) return;

      try {
        if (ctx.message.text) {
          await ctx.telegram.sendMessage(
            user.id,
            "📨 <b>Admin javobi:</b>\n\n" + ctx.message.text,
            { parse_mode: "HTML" }
          );
        }
        if (ctx.message.photo) {
          await ctx.telegram.sendPhoto(
            user.id,
            ctx.message.photo.pop().file_id,
            { caption: "📨 Admin yuborgan rasm" }
          );
        }
      } catch (err) {
        console.log("❌ Userga yuborishda xato:", err.message);
      }
    }
  });

}