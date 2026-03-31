export default async (ctx, params) => {
    let len = parseInt(params);
    if (!len || isNaN(len) || len < 4 || len > 64) len = 12;

    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < len; i++) {
        const randomPoz = Math.floor(Math.random() * charset.length);
        password += charset.substring(randomPoz, randomPoz + 1);
    }
    await ctx.reply("Generated Password:\n`" + password + "`", { parse_mode: "Markdown" });
    return true;
};
