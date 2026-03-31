export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: Word needed. Example: /dictionary Hello");
        return false;
    }
    try {
        const response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + params);
        const data = await response.json();

        if (data[0] && data[0].meanings[0]) {
            const def = data[0].meanings[0].definitions[0].definition;
            await ctx.reply("Definition:\n" + def);
            return true;
        } else {
            await ctx.reply("Word not found.");
            return false;
        }
    } catch (e) {
        await ctx.reply("Word not found.");
        return false;
    }
};
