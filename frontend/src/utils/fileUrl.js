export const getFileUrl = (path) => {
    if (!path) return null;
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");
    return `${base}${path}`;
};