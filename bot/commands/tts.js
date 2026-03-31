export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Text required. Example: /say Hello World");
        return false;
    }
    try {
        const audio_url = "http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=" + encodeURIComponent(params) + "&tl=en";
        await ctx.replyWithAudio({ url: audio_url }, { caption: "Spoken by Bot" });
        return true;
    } catch (e) {
        await ctx.reply("Error generating speech.");
        return false;
    }
};
