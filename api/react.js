const { react } = require('../rch');

module.exports = async (req, res) => {
    // Mengambil parameter dari URL
    const { url, emoji } = req.query;

    if (!url || !emoji) {
        return res.status(400).json({
            status: false,
            error: 'Parameter "url" dan "emoji" wajib diisi! Contoh: ?url=...&emoji=👍'
        });
    }

    try {
        const result = await react(url, emoji);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message || 'Terjadi kesalahan server'
        });
    }
};
