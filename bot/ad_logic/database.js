export const checkAccess = async (userId, env) => {
    try {
        const query = await env.DB.prepare("SELECT * FROM users WHERE telegram_id = ?").bind(userId).first();
        if (!query) return false;

        const lastAdTime = new Date(query.last_ad_time);
        const diffHours = Math.abs(new Date() - lastAdTime) / 36e5;

        return diffHours < 24 && query.usage_count < 10;
    } catch (e) {
        return false;
    }
};

export const incrementUsage = async (userId, env) => {
    try {
        await env.DB.prepare("UPDATE users SET usage_count = usage_count + 1 WHERE telegram_id = ?").bind(userId).run();
    } catch (e) {}
};

export const grantAccess = async (userId, env) => {
    try {
        const now = new Date().toISOString();
        await env.DB.prepare(`
            INSERT INTO users (telegram_id, last_ad_time, usage_count) 
            VALUES (?, ?, 0) 
            ON CONFLICT(telegram_id) DO UPDATE SET last_ad_time = ?, usage_count = 0
        `).bind(userId, now, now).run();
    } catch (e) {}
};
            
