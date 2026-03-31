import { createClient } from '@supabase/supabase-js';

let supabase;
const getSupabase = (env) => {
    if (!supabase && env.SURL && env.SK) {
        supabase = createClient(env.SURL, env.SK);
    }
    return supabase;
};

export const checkAccess = async (userId, env) => {
    const db = getSupabase(env);
    if (!db) return false;
    try {
        const { data, error } = await db.from('users').select('last_ad_time, usage_count').eq('telegram_id', userId).single();
        if (error || !data) return false;

        const lastAdTime = new Date(data.last_ad_time);
        const diffHours = Math.abs(new Date() - lastAdTime) / 36e5;

        return diffHours < 24 && data.usage_count < 10; 
    } catch (e) {
        return false;
    }
};

export const incrementUsage = async (userId, env) => {
    const db = getSupabase(env);
    if (!db) return;
    try {
        const { data } = await db.from('users').select('usage_count').eq('telegram_id', userId).single();
        if (data) {
            await db.from('users').update({ usage_count: data.usage_count + 1 }).eq('telegram_id', userId);
        }
    } catch (e) {}
};

export const grantAccess = async (userId, env) => {
    const db = getSupabase(env);
    if (!db) return;
    try {
        await db.from('users').upsert({
            telegram_id: userId,
            last_ad_time: new Date().toISOString(),
            usage_count: 0
        });
    } catch (e) {}
};
