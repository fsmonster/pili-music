/**
 * 处理B站资源URL，统一转换成本地代理路径
 * @param url B站原始资源URL
 * @returns 处理后的本地代理路径
 */
export function processResourceUrl(url?: string): string {
    if (!url) return '';

    // 已经是代理URL则直接返回
    if (url.startsWith('/biliimg/') || url.startsWith('/api/audio/')) return url;

    // 处理默认头像
    if (url === 'https://static.hdslb.com/images/member/noface.gif') {
        return '/biliimg/default/noface.gif';
    }

    // 匹配 i0~i2.hdslb.com
    if (/^https?:\/\/i[0-2]\.hdslb\.com\//.test(url)) {
        return url.replace(/^https?:\/\/i[0-2]\.hdslb\.com\//, '/biliimg/i2/');
    }

    // 匹配 archive.biliimg.com
    if (url.startsWith('https://archive.biliimg.com')) {
        return url.replace('https://archive.biliimg.com', '/biliimg/archive');
    }

    // 匹配 s1.hdslb.com
    if (url.startsWith('https://s1.hdslb.com')) {
        return url.replace('https://s1.hdslb.com', '/biliimg/s1');
    }

    // 匹配其它 hdslb.com 域名
    if (/^https?:\/\/(.*)\.hdslb\.com\//.test(url)) {
        return url.replace(/^https?:\/\/(.*)\.hdslb\.com\//, '/biliimg/$1/');
    }

    // 处理音频URL，转换成后端代理的格式
    if (url.includes('.bilivideo.cn') || url.includes('.bilivideo.com')) {
        return `/api/play/url?url=${encodeURIComponent(url)}`;
    }

    // 若没有匹配任何规则，返回原始 URL
    return url;
}

export default processResourceUrl;
