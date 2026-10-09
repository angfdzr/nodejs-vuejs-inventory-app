const ApiError = require("../utils/ApiError");

const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next(new ApiError(401, "Anda harus login terlebih dahulu"));
    }
    next();
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return next(new ApiError(403, "Anda tidak memiliki akses ke resource ini"));
        }
        next();
    };
};

module.exports = { requireAuth, requireRole };