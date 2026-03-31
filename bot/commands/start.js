import { Markup } from 'telegraf';

export default async (ctx) => {
    const imageUrl = "https://t.me/OpenUniverse01/15"; 
    const supportUrl = "https://t.me/Pro_Support_All_Time_bot";
    const welcomeText = "Welcome to PRO MULTIFUNCTIONAL BOT.\n\nUse /help to see available use commands.";

    try {
        await ctx.replyWithPhoto(imageUrl, {
            caption: welcomeText,
            reply_markup: { inline_keyboard: [[Markup.button.url('SUPPORT', supportUrl)]] }
        });
    } catch (e) {
        await ctx.reply(welcomeText, {
            reply_markup: { inline_keyboard: [[Markup.button.url('SUPPORT', supportUrl)]] }
        });
    }
};
