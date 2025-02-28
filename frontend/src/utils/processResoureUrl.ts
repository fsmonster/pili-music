/**
 * 处理B站 i0~i2 域名的图片URL，将原始URL转换为本地代理URL
 * @param url B站 i0~i2 域名的原始图片URL
 * @returns 处理后的本地代理URL
 */
function processBiliImageUrlI2(url: string): string {
    const match = url.match(/^https?:\/\/i[0-2]\.hdslb\.com\/(.*)/);
    if (!match) return url;
    return `/biliimg/i2/${match[1]}`;
}

/**
 * 处理B站 archive 域名的图片URL，将原始URL转换为本地代理URL
 * @param url B站 archive 域名的原始图片URL
 * @returns 处理后的本地代理URL
 */
function processBiliImageUrlArchive(url: string): string {
    const match = url.match(/^https?:\/\/archive\.biliimg\.com\/(.*)/);
    if (!match) return url;
    return `/biliimg/archive/${match[1]}`;
}

/**
 * 处理B站其它域名的图片URL，将原始URL转换为本地代理URL
 * @param url B站其它域名的原始图片URL
 * @returns 处理后的本地代理URL
 */
function processBiliImageUrlOthers(url: string): string {
    const match = url.match(/^https?:\/\/(.*)\.hdslb\.com\/(.*)/);
    if (!match) return url;
    return `/biliimg/${match[1]}/${match[2]}`;
}

/**
 * 处理B站音频流URL，将原始URL转换为本地代理URL
 * @param url B站音频流的原始URL
 * @returns 处理后的本地代理URL
 */
function processBiliAudioUrl(url: string): string {
    const match = url.match(/^https?:\/\/([\w\-]+)\.mcdn\.bilivideo\.cn:4483\/upgcxcode\/(.*)/);
    if (!match) return url;
    return `/biliaudio/${match[1]}/${match[2]}`;
}

/**
 * 处理B站图片URL，将原始URL转换为本地代理URL
 * @param url B站原始图片URL
 * @returns 处理后的本地代理URL
 */
export function processResourceUrl(url: string): string {
    if (!url) return '';
    // 已经是代理URL则直接返回
    if (url.startsWith('/biliimg/') || url.startsWith('/biliaudio/')) return url;

    // 根据不同类型的URL分开处理
    if (url.startsWith('https://i') && url.includes('.hdslb.com')) {
        return processBiliImageUrlI2(url);
    }
    if (url.startsWith('https://archive.biliimg.com')) {
        return processBiliImageUrlArchive(url);
    }
    if (url.includes('.mcdn.bilivideo.cn:4483')) {
        return processBiliAudioUrl(url);
    }
    return processBiliImageUrlOthers(url);
}

export default processResourceUrl;
