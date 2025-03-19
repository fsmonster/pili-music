/**
 * @param url 收藏夹URL
 * @returns 收藏夹ID
 */
export const extractFavoriteIdFromUrl = (url: string) => {
    const match = url.match(/fid=(\d+)/);
    return match ? Number(match[1]) : null;
};
