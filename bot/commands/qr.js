export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Text required. Example: /qr Hello");
        return false;
    }
    try {
        const qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=" + encodeURIComponent(params);
        await ctx.replyWithPhoto(qr_url, { caption: params });
        return true;
    } catch (e) {
        await ctx.reply("Error generating QR code.");
        return false;
    }
};
