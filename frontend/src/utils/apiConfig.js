const getApiUrl = (path = "") => {
    let baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, "");
    if (!baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

export default getApiUrl;
