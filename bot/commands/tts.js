export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Text required. Example: /say Hello World");
        return false;
    }
    
    try {
        const text = encodeURIComponent(params);
        const audio_url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${text}&tl=en`;


        const response = await fetch(audio_url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!response.ok) throw new Error("Google Audio Fetch Failed");

        const arrayBuffer = await response.arrayBuffer();
        
        
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });


        const formData = new FormData();
        formData.append('chat_id', ctx.chat.id);
        formData.append('audio', blob, 'voice.mp3');
        formData.append('caption', 'Spoken by Bot');

        const tgResponse = await fetch(`https://api.telegram.org/bot${ctx.telegram.token}/sendAudio`, {
            method: 'POST',
            body: formData
        });

        if (!tgResponse.ok) {
            throw new Error("Telegram Upload Failed");
        }

        return true;
        
    } catch (e) {
        await ctx.reply("System Error: " + e.message);
        return false;
    }
};
        
