/**
 * React Channel 2.0
 * Creator: IzzXd
 * Base: https://reactch20jiyyad.vercel.app
 * Saluran: https://whatsapp.com/channel/0029VbDyL6d9RZAh3JjEM325
 * Note: pliss guys jangan di klaim 100% buatan lu, lu boleh kok modifikasi trs share lagi tapi tolong jangan ilangin header creator sama ch-nya
 */

const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

const _p = ["fJMupwGtP5IrlSHzB608x3nEdfsErTvFeMd081GnP5Ap", "w3XyVqs9w32RI6cD+GrEeJYnpgT4PsEolCOiAao8xw=="];
const _k = [0x4d, 0xa1, 0x17, 0xc3, 0x62, 0x9e, 0x0b, 0xf4];

function _ld() {
    const raw = Buffer.from(_p.join(''), 'base64');
    const out = Buffer.alloc(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw[i] ^ _k[i % _k.length];
    return out.toString('utf8');
}

function _hd() {
    try {
        const src = fs.readFileSync(__filename, 'utf8');
        const m = src.match(/^\s*\/\*\*[\s\S]*?\*\//);
        if (!m) return '';
        const keys = ['Creator:', 'Saluran:', 'Note:'];
        const lines = m[0].split('\n').map(l => l.replace(/^\s*\*?\s*/, '').replace(/\s+/g, ''));
        const pick = keys.map(k => lines.find(l => l.startsWith(k)));
        if (pick.some(x => !x)) return '';
        return crypto.createHash('sha256').update(pick.join('')).digest('hex');
    } catch (_) {
        return '';
    }
}

function _ck() {
    const h = _hd();
    if (!h || h !== _ld()) throw new Error('ctx invalid');
}

const CREATOR = 'IzzXd';
const SALURAN = 'https://whatsapp.com/channel/0029VbDyL6d9RZAh3JjEM325';
const BASE_URL = 'https://reactch20jiyyad.vercel.app';

const URL_REGEX = /^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]+\/\d+\/?$/;

let proxyPool = [];
let proxyIndex = 0;
let lastProxyFetch = 0;

async function fetchProxies() {
    const now = Date.now();
    if (proxyPool.length > 0 && (now - lastProxyFetch) < 300000) {
        return proxyPool;
    }
    const pool = [];
    try {
        const res = await axios.get('https://api.ikyyxd.my.id/v2l/proxy-free/ikyy-xsample', { timeout: 8000 });
        if (Array.isArray(res.data)) {
            res.data.forEach((p) => {
                if (typeof p === 'string' && p.includes(':')) {
                    const parts = p.trim().split(':');
                    if (parts.length >= 4) {
                        pool.push({
                            type: 'http',
                            url: `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`
                        });
                    }
                }
            });
        }
    } catch (_) {}

    try {
        const res = await axios.get('https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text&protocol=socks5&timeout=5000', { timeout: 8000 });
        if (typeof res.data === 'string') {
            const lines = res.data.split(/\r?\n/).filter(Boolean);
            lines.forEach((l) => {
                if (l.startsWith('socks5://')) {
                    pool.push({ type: 'socks5', url: l.trim() });
                }
            });
        }
    } catch (_) {}

    if (pool.length > 0) {
        proxyPool = pool;
        lastProxyFetch = now;
    }
    return proxyPool;
}

function getNextProxyAgent() {
    if (!proxyPool.length) return null;
    const item = proxyPool[proxyIndex % proxyPool.length];
    proxyIndex++;
    try {
        if (item.type === 'socks5') {
            return new SocksProxyAgent(item.url);
        }
        return new HttpsProxyAgent(item.url);
    } catch (_) {
        return null;
    }
}

function formatSuccess(data, startTime) {
    return {
        Creator: CREATOR,
        Saluran: SALURAN,
        time: `${Date.now() - startTime}ms`,
        status: true,
        ...data
    };
}

function formatError(err, startTime) {
    let msg = err && err.message ? err.message : String(err);
    if (err && err.response && err.response.data) {
        const d = err.response.data;
        if (typeof d === 'string') {
            msg = d;
        } else if (d.result && d.result.message) {
            msg = d.result.message;
        } else if (d.message) {
            msg = d.message;
        } else if (d.error) {
            msg = d.error;
        }
    }
    return {
        Creator: CREATOR,
        Saluran: SALURAN,
        time: `${Date.now() - startTime}ms`,
        status: false,
        error: msg
    };
}

async function apiRequest(endpoint, options = {}) {
    _ck();
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const data = options.data || undefined;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/`,
        ...(options.headers || {})
    };

    let attempt = 0;
    const maxAttempts = options.forceProxy ? 3 : 2;
    let lastError = null;

    while (attempt < maxAttempts) {
        attempt++;
        let agent = null;
        if (options.forceProxy || attempt > 1) {
            await fetchProxies();
            agent = getNextProxyAgent();
        }

        try {
            const reqConfig = {
                method,
                url,
                headers,
                data,
                timeout: options.timeout || 25000
            };
            if (agent) {
                reqConfig.httpsAgent = agent;
                reqConfig.httpAgent = agent;
            }

            const response = await axios(reqConfig);
            return response.data;
        } catch (err) {
            lastError = err;
            const status = err.response ? err.response.status : 0;
            const isRateLimit = status === 429 || status === 403;
            if (!isRateLimit && attempt === 1 && !options.forceProxy && err.code !== 'ECONNRESET' && err.code !== 'ETIMEDOUT') {
                throw err;
            }
        }
    }

    throw lastError || new Error('Request gagal setelah beberapa percobaan.');
}

async function react(targetUrl, emoji = '👍', options = {}) {
    _ck();
    const startTime = Date.now();

    try {
        const cleanUrl = String(targetUrl || '').trim();
        if (!cleanUrl) {
            throw new Error('URL postingan saluran WhatsApp wajib diisi.');
        }

        if (!URL_REGEX.test(cleanUrl)) {
            throw new Error('Format link tidak valid! Harus: https://whatsapp.com/channel/<id>/<nomor-postingan>');
        }

        const cleanEmoji = String(emoji || '👍').trim();

        const res = await apiRequest('/api/react', {
            method: 'POST',
            data: {
                url: cleanUrl,
                reaction: cleanEmoji
            },
            forceProxy: options.forceProxy || false
        });

        if (res && res.status === true && res.result) {
            return formatSuccess({
                message: res.result.message || 'Reaction VIP API masuk antrean.',
                target: res.result.target || cleanUrl,
                reaction: res.result.reaction || cleanEmoji,
                reactions: res.result.reactions || [cleanEmoji],
                total_emojis: res.result.total_emojis || 1,
                task_status: res.result.task ? res.result.task.status : 'Success',
                response_time: res.result.response_time || `${Date.now() - startTime}ms`
            }, startTime);
        }

        throw new Error((res && (res.message || res.error)) || 'Gagal mengirim reaksi ke saluran.');
    } catch (err) {
        return formatError(err, startTime);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const url = args[0];
    const emoji = args[1] || '👍';

    if (!url) {
        console.log('Usage:');
        console.log(' node rch <channel_post_url> <emoji>');
        return;
    }

    const res = await react(url, emoji);
    console.log(JSON.stringify(res, null, 2));
}

if (require.main === module) {
    main();
}

module.exports = {
    react
};
