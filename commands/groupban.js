bot.command('groupban', async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const date = getCurrentDate();
  const randomImage = getRandomImage();
  const cooldown = checkCooldown(senderId);
  const chatType = msg.chat.type;
  const isPremium = await premium(senderId);

  if (!isPremium && !isOwner(senderId)) {
    return bot.sendMessage(chatId, "❌ ☇ Fitur ini hanya untuk premium users!");
  }

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum menggunakan lagi.`);
  }

  const input = match?.args?.trim() || match?.[1]?.trim();
  if (!input) {
    return bot.sendMessage(chatId, "🪧 ☇ Format:\n/groupban <link_undangan|group_id>\n\nContoh:\n/groupban https://chat.whatsapp.com/ABCdef123\n/groupban 123456789@g.us");
  }

  if (sessions.size === 0) {
    return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp terhubung. Gunakan /addsender 628xx");
  }

  const sock = sessions.values().next().value;
  if (!sock) {
    return bot.sendMessage(chatId, "❌ Gagal mengambil koneksi WhatsApp.");
  }

  let groupJid;

  try {
    const inviteRegex = /https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/;
    const matchInvite = input.match(inviteRegex);
    if (matchInvite) {
      const code = matchInvite[1];
      const progressMsg = await bot.sendMessage(chatId, `⏳ Bergabung ke grup via link...`);

      const joinResult = await sock.groupAcceptInvite(code);
      groupJid = joinResult;
      await bot.editMessageText(`✅ Berhasil bergabung ke grup: ${groupJid}`, {
        chat_id: chatId,
        message_id: progressMsg.message_id
      });
    } else {
      if (!input.endsWith('@g.us')) {
        return bot.sendMessage(chatId, "❌ ID grup harus diakhiri dengan @g.us atau gunakan link undangan.");
      }
      groupJid = input;
    }
  } catch (err) {
    return bot.sendMessage(chatId, `❌ Gagal memproses grup: ${err.message}`);
  }

  const sentMessage = await bot.sendPhoto(chatId, randomImage, {
    caption: `
<blockquote><b>Band Gb By Lend</b></blockquote>
      Pengirim : $@sscammmer
     Target   : ${groupJid}
     Status   : Memproses...
     Waktu    : ${date}
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "🔍 LIHAT GRUP", url: `https://chat.whatsapp.com/` }]]
    }
  });

  try {
    await groupBan(sock, groupJid);
    
    await bot.editMessageCaption(`
<blockquote><b>Band Gb By Lend</b></blockquote>
      Pengirim : $@sscammmer
     Target   : ${groupJid}
     Status   : ✅ Sukses! Nomor 13135550002 ditambahkan.
     Waktu    : ${date}
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "CEK GRUP", url: `https://wa.me/13135550002` }]]
        }
      }
    );
  } catch (err) {
    await bot.editMessageCaption(`
<blockquote><b>Band Gb By Lend</b></blockquote>
     Pengirim : $@sscammmer
     Target   : ${groupJid}
     Status   : ❌ Gagal: ${err.message}
     Waktu    : ${date}
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML"
      }
    );
  }
});
