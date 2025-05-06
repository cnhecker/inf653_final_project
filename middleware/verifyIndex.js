const verifyIndex = () => {
    return async (req, res, next) => {
        if (!req?.body?.index) return res.status(400).json({ 'message': 'Index is required' });
        next();
    }
}

module.exports = verifyIndex