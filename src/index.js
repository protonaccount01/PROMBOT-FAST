import { Telegraf, Markup } from 'telegraf';
import { checkAccess, grantAccess, incrementUsage } from '../bot/ad_logic/database.js';

import cmdStart from '../bot/commands/start.js';
import cmdHelp from '../bot/commands/help.js';
import cmdQR from '../bot/commands/qr.js';
import cmdBarcodeGen from '../bot/commands/barcode_gen.js';
import cmdUrls from '../bot/commands/urls.js';
import cmdDict from '../bot/commands/dictionary.js';
import cmdPass from '../bot/commands/pass_gen.js';
import cmdIp from '../bot/commands/ip_info.js';
import cmdTts from '../bot/commands/tts.js';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loading Ad</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="//libtl.com/sdk.js" data-zone="10619721" data-sdk="show_10619721"></script>
    <style>
        body { background-color: #000; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .message { font-size: 18px; color: #ccc; text-align: center; }
    </style>
</head>
<body>
    <div id="msg" class="message">Loading Ad... Please wait.</div>
    <script>
        const tg = window.Telegram.WebApp;
        tg.expand();
        const params = new URLSearchParams(window.location.search);
        
        function finishAndSend() {
            document.getElementById('msg').innerText = "Processing your request...";
            fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_ad_complete: true,
                    cmd: params.get('cmd'),
                    data: params.get('data'),
                    mid: parseInt(params.get('mid')),
                    adMid: parseInt(params.get('adMid')),
                    cid: parseInt(params.get('cid'))
                })
            }).then(() => tg.close()).catch(() => tg.close());
        }

        window.onload = () => {
            if (typeof show_10619721 === 'function') {
                show_10619721().then(() => finishAndSend()).catch(() => finishAndSend());
            } else { finishAndSend(); }
        };
    </script>
</body>
</html>`;

const getPayload = (ctx) => {
    const text = ctx.message?.text || ctx.message?.caption || '';
    return text.split(' ').slice(1).join(' ');
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (request.method === 'GET' && (url.pathname === '/index.html' || url.pathname === '/')) {
            return new Response(HTML_CONTENT, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
        }

        if (request.method === 'POST') {
            const bot = new Telegraf(env.B);
            const WEB_APP_URL = `https://${url.hostname}/index.html`;

            const handleCommand = async (ctxBot, cmdName, cmdFunc, payload) => {
                const userId = ctxBot.from.id;
                const hasAccess = await checkAccess(userId, env);

                if (hasAccess) {
                    const isSuccess = await cmdFunc(ctxBot, payload);
                    if (isSuccess) await incrementUsage(userId, env);
                } else {
                    const safePayload = encodeURIComponent(payload || 'none');
                    const userMsgId = ctxBot.message.message_id;
                    const chatId = ctxBot.chat.id;
                    
                    const adMsg = await ctxBot.reply("Generating secure ad link...");
                    const link = `${WEB_APP_URL}?cmd=${cmdName}&data=${safePayload}&mid=${userMsgId}&adMid=${adMsg.message_id}&cid=${chatId}`;
                    
                    await ctxBot.telegram.editMessageText(chatId, adMsg.message_id, undefined, 
                        "Please watch a short ad to unlock 10 commands for 24 hours.", 
                        Markup.inlineKeyboard([ Markup.button.webApp("Watch Ad to Unlock", link) ])
                    );
                }
            };

            bot.start(cmdStart);
            bot.help(cmdHelp);
            bot.command('qr', (ctxBot) => handleCommand(ctxBot, 'qr', cmdQR, getPayload(ctxBot)));
            bot.command('barcode_gen', (ctxBot) => handleCommand(ctxBot, 'barcode_gen', cmdBarcodeGen, getPayload(ctxBot)));
            bot.command('urls', (ctxBot) => handleCommand(ctxBot, 'urls', cmdUrls, getPayload(ctxBot)));
            bot.command('dictionary', (ctxBot) => handleCommand(ctxBot, 'dict', cmdDict, getPayload(ctxBot)));
            bot.command('pass_gen', (ctxBot) => handleCommand(ctxBot, 'pass', cmdPass, getPayload(ctxBot)));
            bot.command('ip_info', (ctxBot) => handleCommand(ctxBot, 'ip', cmdIp, getPayload(ctxBot)));
            bot.command('say', (ctxBot) => handleCommand(ctxBot, 'say', cmdTts, getPayload(ctxBot)));

            const body = await request.json();

            if (body && body.is_ad_complete) {
                const { cmd, data, mid, adMid, cid } = body;
                const decodedData = decodeURIComponent(data);

                await grantAccess(cid, env);
                if (adMid) try { await bot.telegram.deleteMessage(cid, adMid); } catch(e){}
                try { await bot.telegram.deleteMessage(cid, mid); } catch(e){}

                await bot.telegram.sendMessage(cid, "Premium Access Granted! You can use 10 commands for the next 24 hours.");

                const mockCtx = {
                    telegram: bot.telegram,
                    reply: (text, extra) => bot.telegram.sendMessage(cid, text, extra),
                    replyWithPhoto: (photo, extra) => bot.telegram.sendPhoto(cid, photo, extra),
                    replyWithAudio: (audio, extra) => bot.telegram.sendAudio(cid, audio, extra)
                };

                let isSuccess = false;
                if (cmd === 'qr') isSuccess = await cmdQR(mockCtx, decodedData);
                else if (cmd === 'barcode_gen') isSuccess = await cmdBarcodeGen(mockCtx, decodedData);
                else if (cmd === 'urls') isSuccess = await cmdUrls(mockCtx, decodedData);
                else if (cmd === 'dict') isSuccess = await cmdDict(mockCtx, decodedData);
                else if (cmd === 'pass') isSuccess = await cmdPass(mockCtx, decodedData);
                else if (cmd === 'ip') isSuccess = await cmdIp(mockCtx, decodedData);
                else if (cmd === 'say') isSuccess = await cmdTts(mockCtx, decodedData);

                if (isSuccess) await incrementUsage(cid, env);
                return new Response(JSON.stringify({ ok: true }), { status: 200 });
            }

            await bot.handleUpdate(body);
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        return new Response("Bot Active", { status: 200 });
    }
};
