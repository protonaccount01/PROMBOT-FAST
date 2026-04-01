export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Text required. Example: /say Hello World");
        return false;
    }
    try {
        const audio_url = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=" + encodeURIComponent(params) + "&tl=en";

        const response = await fetch(audio_url);
        if (!response.ok) throw new Error("Audio fetch failed");

        const arrayBuffer = await response.arrayBuffer();

        await ctx.replyWithAudio({ source: new Uint8Array(arrayBuffer) }, { caption: "Spoken by Bot" });
        return true;
    } catch (e) {
        await ctx.reply("Error generating speech.");
        return false;
    }
};
