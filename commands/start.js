export default {
    name: 'start',
    description: 'Mulai bot',
    async execute(bot, msg, args, ctx) {
        const chatId = msg.chat.id;
        const name = msg.from.first_name || 'Bos';

        const welcome = `
👑 *DLOUISTH WA BOT*
━━━━━━━━━━━━━━━━━━

Halo *${name}*! 👋
Selamat datang di bot Telegram premium.

Gua siap bantu lo 24/7. Ketik /menu buat liat semua command yang tersedia.

━━━━━━━━━━━━━━━━━━
⚡ _Powered by DLOUISTH_
        `;

        bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
    }
};
