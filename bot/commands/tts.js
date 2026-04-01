import { Buffer } from 'node:buffer';

export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Text required. Example: /say Hello World");
        return false;
    }
    
    try {
        const audio_url = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=" + encodeURIComponent(params) + "&tl=en";

        
        const response = await fetch(audio_url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`Google API Status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Cloudflare-এ Node.js Buffer ব্যবহার

        
        await ctx.replyWithAudio(
            { source: buffer, filename: 'voice.mp3' }, 
            { caption: "Spoken by Bot" }
        );
        
        return true;
        
    } catch (e) {
        
        await ctx.reply("System Error: " + e.message);
        return false;
    }
};
            
