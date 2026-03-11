import { Markup } from "telegraf";
import { DISTRICTS } from "../config.js";
import fs from "fs-extra";
import { saveUser } from "./storage.js";

export function handleDistrict(bot) {

  // =============================
  // TUMAN TANLANGANDA
  // =============================
  bot.action(/DISTRICT_(.+)/, async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const districtName = ctx.match[1];
      const district = DISTRICTS.find(d => d.name === districtName);

      if (!district) {
        return ctx.reply("❌ Tuman topilmadi.");
      }

      // Foydalanuvchining tanlangan tumani saqlanadi, ammo murojaat hali aktiv emas
      await saveUser(ctx.from.id, {
        district: district,
        active: false
      });

      const employeesData = await fs.readJson("./data/employees.json");
      const hodimlar = employeesData[districtName] || [];

      let text = `📍 <b>${districtName} tuman hodimlari</b>\n\n`;

      if (!hodimlar.length) {
        text += "❌ Bu tuman uchun hodimlar mavjud emas.\n\n";
      } else {
        hodimlar.forEach((h) => {
          text += `┌────────────────────\n`;
          text += `👤 <b>${h.ism} ${h.familiya}</b>\n`;
          text += `📞 <a href="tel:${h.tel}">${h.tel}</a>\n`;
          text += `└────────────────────\n\n`;
        });
      }

      text += `✍️ Murojaat yuborish uchun pastdagi tugmani bosing`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("📩 Murojaat yuborish", "START_REQUEST")],
        [Markup.button.callback("⬅️ Orqaga", "BACK_TO_DISTRICTS")]
      ]);

      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: keyboard
      });

    } catch (err) {
      console.error("❌ district callback xatosi:", err);
    }
  });

  // =============================
  // ORQAGA BOSILGANDA
  // =============================
  bot.action("BACK_TO_DISTRICTS", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const buttons = DISTRICTS.map(d =>
        Markup.button.callback(d.name, `DISTRICT_${d.name}`)
      );

      const keyboard = Markup.inlineKeyboard(buttons, { columns: 3 });

      await ctx.editMessageText(
        "📍 Hududingizni tanlang:",
        { reply_markup: keyboard }
      );

    } catch (err) {
      console.error("❌ BACK_TO_DISTRICTS xatosi:", err);
    }
  });

}