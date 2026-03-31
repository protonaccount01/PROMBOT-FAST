export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Text required. Example: /barcode_gen 123456");
        return false;
    }
    try {
        const barcode_url = "https://bwipjs-api.metafloor.com/?bcid=code128&text=" + encodeURIComponent(params) + "&scale=3&includetext";
        await ctx.replyWithPhoto(barcode_url, { caption: "Barcode for: " + params });
        return true;
    } catch (e) {
        await ctx.reply("Error generating barcode.");
        return false;
    }
};
