const getPagination = (query) => {
    const page = parseInt(query.page) > 0 ? parseInt(query.page) : 1;
    const limit = parseInt(query.limit) > 0 ? parseInt(query.limit) : 10;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

const buildPaginatedResponse = (data, count, page, limit) => {
    return {
        data,
        pagination: {
            total_data: count,
            total_page: Math.ceil(count / limit),
            current_page: page,
            limit
        }
    };
};

module.exports = { getPagination, buildPaginatedResponse };