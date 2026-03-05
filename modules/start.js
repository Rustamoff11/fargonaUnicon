import { Markup } from "telegraf";
import { DISTRICTS } from "../config.js";
import { saveUser, getUser } from "./storage.js";

const SUPER_ADMINS = (process.env.SUPER_ADMIN_IDS || "")
  .split(",")
  .filter(Boolean)
  .map(Number);

const OPERATORS = (process.env.OPERATOR_IDS || "")
  .split(",")
  .filter(Boolean)
  .map(Number);

function isOperator(id) {
  return OPERATORS.includes(id) || SUPER_ADMINS.includes(id);
}

export function handleStart(bot) {

  // =============================
  // START BOSILGANDA
  // =============================
  bot.start(async (ctx) => {
    try {

      const existingUser = await getUser(ctx.from.id);

      if (!existingUser || !existingUser.phone) {
        return ctx.reply(
          "📱 Iltimos, telefon raqamingizni yuboring:",
          Markup.keyboard([
            [Markup.button.contactRequest("📞 Raqamni yuborish")]
          ])
            .resize()
            .oneTime()
        );
      }

      await showDistricts(ctx);

    } catch (err) {
      console.error("Start xato:", err);
    }
  });

  // =============================
  // KONTAKT QABUL QILISH
  // =============================
  bot.on("contact", async (ctx) => {

    try {

      const contact = ctx.message.contact;

      if (contact.user_id !== ctx.from.id) {
        return ctx.reply("❌ Iltimos, o‘z raqamingizni yuboring.");
      }

      await saveUser(ctx.from.id, {
        phone: contact.phone_number,
        firstName: ctx.from.first_name,
        username: ctx.from.username || null,
        registeredAt: new Date().toISOString()
      });

      await ctx.reply("✅ Raqam qabul qilindi.", Markup.removeKeyboard());

      await showDistricts(ctx);

    } catch (err) {
      console.error("Kontakt xato:", err);
    }

  });

  // =============================
  // BOSHQARUV GURUHI
  // =============================
  bot.action("TEAM_INFO", async (ctx) => {

    await ctx.answerCbQuery();

    const text = `
👥 <b>Boshqaruv guruhi</b>

📌 Bo‘lim boshlig‘i
<b>Azamat G‘offurov</b>

🎨 Dizayner
<b>Asqarov G‘anijon</b>

💻 Dasturchi
<b>Rustamov Nodirbek</b>

🔄 Botdan foydalanishni davom ettirish uchun
<b>/start</b> buyrug‘ini yuboring.
`;

    const shareText = `
🤖 FarIjro Bot

📩 Murojaat yuborish uchun qulay bot

📌 Hudud tanlaysiz
📌 Murojaat yozasiz
📌 Adminlarga yetib boradi

👥 Boshqaruv guruhi
👨‍💼 Azamat G‘offurov
🎨 Asqarov G‘anijon
💻 Rustamov Nodirbek

👇 Botga kirish
https://t.me/${ctx.botInfo.username}
`;

    await ctx.replyWithPhoto(
      { source: "data/team.png" },
      {
        caption: text,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [
            Markup.button.url(
              "📤 Do‘stlarga ulashish",
              `https://t.me/share/url?url=https://t.me/${ctx.botInfo.username}&text=${encodeURIComponent(shareText)}`
            )
          ]
        ])
      }
    );

  });

}


// =============================
// HUDUDLARNI CHIQARISH
// =============================
async function showDistricts(ctx) {

  const rows = [];

  for (let i = 0; i < DISTRICTS.length; i += 4) {

    rows.push(
      DISTRICTS.slice(i, i + 4).map(d =>
        Markup.button.callback(d.name, `APPLY_${d.name}`)
      )
    );

  }

  // 👥 BOSHQARUV GURUHI
  rows.push([
    Markup.button.callback("👥 Boshqaruv guruhi", "TEAM_INFO")
  ]);

  // 👑 ADMIN PANEL
  if (ctx.from && (
    (process.env.OPERATOR_IDS || "").includes(ctx.from.id.toString()) ||
    (process.env.SUPER_ADMIN_IDS || "").includes(ctx.from.id.toString())
  )) {

    rows.push([
      Markup.button.callback("👑 Admin Panel", "OPEN_ADMIN_PANEL")
    ]);

  }

  await ctx.reply(
    "📍 Hududingizni tanlang:",
    Markup.inlineKeyboard(rows)
  );

}