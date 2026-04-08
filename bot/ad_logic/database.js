export const checkAccess = async (userId, env) => {
    try {
        if (!env.DB) throw new Error("DB binding missing!");
        

        const idStr = String(userId); 
        const query = await env.DB.prepare("SELECT * FROM users WHERE telegram_id = ?").bind(idStr).first();
        
        if (!query) return false;

        const lastAdTime = new Date(query.last_ad_time);
        const diffHours = Math.abs(new Date() - lastAdTime) / 36e5;

        return diffHours < 24 && query.usage_count < 10;
    } catch (e) {
        console.error("DB Check Error:", e.message);
        return false;
    }
};

export const incrementUsage = async (userId, env) => {
    try {
        const idStr = String(userId);
        await env.DB.prepare("UPDATE users SET usage_count = usage_count + 1 WHERE telegram_id = ?").bind(idStr).run();
    } catch (e) {
        console.error("DB Increment Error:", e.message);
    }
};

export const grantAccess = async (userId, env) => {
    try {
        const idStr = String(userId);
        const now = new Date().toISOString();
        

        await env.DB.prepare(`
            INSERT INTO users (telegram_id, last_ad_time, usage_count) 
            VALUES (?, ?, 0) 
            ON CONFLICT(telegram_id) DO UPDATE SET last_ad_time = excluded.last_ad_time, usage_count = 0
        `).bind(idStr, now).run();
        
    } catch (e) {
        console.error("DB Grant Error:", e.message);
    }
};
