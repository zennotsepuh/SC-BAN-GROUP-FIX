import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN belum di-set di .env!');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🚀 Telegram Bot starting...');

// ==================== LOAD COMMANDS ====================
const commands = new Map();
const commandsDir = path.join(__dirname, 'commands');

if (fs.existsSync(commandsDir)) {
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const cmd = await import(`./commands/${file}`);
        if (cmd.default && cmd.default.name) {
            commands.set(cmd.default.name, cmd.default);
            console.log(`✅ Loaded command: /${cmd.default.name}`);
        }
    }
}

// ==================== MIDDLEWARE ====================
const stats = {
    messages: 0,
    commands: 0,
    startTime: Date.now()
};

// ==================== HANDLE MESSAGE ====================
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name || 'Unknown';

    stats.messages++;

    // Log pesan masuk
    console.log(`📩 [${username}] ${text}`);

    // Cek command
    if (text.startsWith('/')) {
        stats.commands++;
        const args = text.slice(1).split(' ');
        const cmdName = args[0].toLowerCase();
        const cmdArgs = args.slice(1);

        const command = commands.get(cmdName);
        if (command) {
            try {
                await command.execute(bot, msg, cmdArgs, { stats, OWNER_ID });
            } catch (err) {
                console.error(`❌ Error di command /${cmdName}:`, err.message);
                bot.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        } else {
            bot.sendMessage(chatId, `❓ Command /${cmdName} gak ada, bos.\nKetik /menu buat liat daftar command.`);
        }
    }
});

// ==================== ERROR HANDLER ====================
bot.on('polling_error', (err) => {
    console.error('❌ Polling error:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught exception:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled rejection:', err.message);
});

console.log('✅ Bot siap nerima pesan!');
