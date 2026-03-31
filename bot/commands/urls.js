export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Link required. Example: /urls https://google.com");
        return false;
    }
    try {
        const response = await fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(params));
        const shortUrl = await response.text();
        
        await ctx.reply(`Your URL is ready! <a href="${shortUrl}">Click Here</a>`, { 
            parse_mode: "HTML",
            disable_web_page_preview: true 
        });
        return true;
    } catch (e) {
        await ctx.reply("Error generating short URL.");
        return false;
    }
};
  
