import { Markup } from "telegraf";
import { DISTRICTS } from "../config.js";
import fs from "fs-extra";

export function handleDistrict(bot) {

  // 📍 Tuman bosilganda
  bot.action(/DISTRICT_(.+)/, async (ctx) => {
    try {
      const districtName = ctx.match[1];
      const district = DISTRICTS.find(d => d.name === districtName);
      if (!district) return;

      await ctx.answerCbQuery();

      const employeesData = await fs.readJson("./data/employees.json");
      const hodimlar = employeesData[districtName] || [];

      if (!hodimlar.length) {
        await ctx.reply("❌ Bu tuman uchun hodimlar mavjud emas.");
        return;
      }

      let text = `📍 <b>${districtName} tuman hodimlari</b>\n\n`;

      hodimlar.forEach((h) => {
        text += `┌────────────────────\n`;
        text += `👤 <b>${h.ism} ${h.familiya}</b>\n`;
        text += `📞 <a href="tel:${h.tel}">${h.tel}</a>\n`;
        text += `└────────────────────\n\n`;
      });

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("📩 Murojaat yuborish", `APPLY_${districtName}`)],
        [Markup.button.callback("⬅️ Orqaga", "BACK_TO_DISTRICTS")]
      ]);

      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup
      });

    } catch (err) {
      console.error("Xatolik /district callbackda:", err);
    }
  });


  // ⬅️ Orqaga bosilganda Tuman menyusiga qaytish
  bot.action("BACK_TO_DISTRICTS", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const buttons = DISTRICTS.map(d =>
        Markup.button.callback(d.name, `DISTRICT_${d.name}`)
      );

      const keyboard = Markup.inlineKeyboard(buttons, { columns: 4 });

      await ctx.editMessageText(
        "📍 Hududingizni tanlang:",
        keyboard
      );

    } catch (err) {
      console.error("Orqaga tugmasida xatolik:", err);
    }
  });

}