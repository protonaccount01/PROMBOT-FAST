export default async (ctx, params) => {
    if (!params) {
        await ctx.reply("Error: IP needed. Example: /ip_info 8.8.8.8");
        return false;
    }
    try {
        const response = await fetch("http://ip-api.com/json/" + params);
        const data = await response.json();

        if (data.status === "fail") {
            await ctx.reply("Invalid IP Address.");
            return false;
        } else {
            const msg = "IP Info:\nCountry: " + data.country + "\nCity: " + data.city + "\nISP: " + data.isp;
            await ctx.reply(msg);
            return true;
        }
    } catch (e) {
        await ctx.reply("Error fetching IP info.");
        return false;
    }
};
