export default async (ctx) => {
    const helpText = `Available Commands:\n\n/qr <text> - Generate QR Code\n/urls <link> - Shorten URL\n/dictionary <word> - English Definition\n/pass_gen <length> - Generate Password\n/ip_info <ip> - IP Geolocation\n/say <text> - Text to Speech`;
    await ctx.reply(helpText);
};
