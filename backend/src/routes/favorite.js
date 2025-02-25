const Router = require('@koa/router');
const axios = require('axios');

const router = new Router({ prefix: '/api/favorite' });

/**
 * 获取用户收藏夹列表
 * @param {number} up_mid - 用户UID
 * @returns {Array} 收藏夹列表
 */
router.get('/list', async (ctx) => {
  const { up_mid } = ctx.query;
  if (!up_mid) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少必要参数：up_mid' };
    return;
  }

  try {
    const response = await axios.get(`https://api.bilibili.com/x/v3/fav/folder/created/list-all`, {
      params: { up_mid },
      headers: {
        'Cookie': `SESSDATA=${ctx.cookies.get('SESSDATA')}`,
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.bilibili.com'
      }
    });

    ctx.body = response.data;
  } catch (error) {
    console.error('获取收藏夹列表失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '获取收藏夹列表失败' };
  }
});

/**
 * 获取收藏夹内容
 * @param {number} media_id - 收藏夹ID
 * @param {number} pn - 页码
 * @param {number} ps - 每页数量
 * @returns {Array} 收藏夹内容列表
 */
router.get('/content', async (ctx) => {
  const { media_id, pn = 1, ps = 20 } = ctx.query;
  if (!media_id) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少必要参数：media_id' };
    return;
  }

  try {
    const response = await axios.get(`https://api.bilibili.com/x/v3/fav/resource/list`, {
      params: { media_id, pn, ps },
      headers: {
        'Cookie': `SESSDATA=${ctx.cookies.get('SESSDATA')}`,
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.bilibili.com'
      }
    });

    ctx.body = response.data;
  } catch (error) {
    console.error('获取收藏夹内容失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '获取收藏夹内容失败' };
  }
});

/**
 * 获取视频cid信息
 * @param {number} aid - 视频aid
 * @returns {Object} 视频信息，包含cid
 */
router.get('/video/info', async (ctx) => {
  const { aid } = ctx.query;
  if (!aid) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少必要参数：aid' };
    return;
  }

  try {
    const response = await axios.get(`https://api.bilibili.com/x/web-interface/view`, {
      params: { aid },
      headers: {
        'Cookie': `SESSDATA=${ctx.cookies.get('SESSDATA')}`,
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.bilibili.com'
      }
    });

    ctx.body = response.data;
  } catch (error) {
    console.error('获取视频信息失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '获取视频信息失败' };
  }
});

/**
 * 获取音频流URL
 * @param {number} aid - 视频aid
 * @param {number} cid - 视频cid
 * @returns {Object} 音频流信息
 */
router.get('/audio/url', async (ctx) => {
  const { aid, cid } = ctx.query;
  if (!aid || !cid) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少必要参数：aid 或 cid' };
    return;
  }

  try {
    const response = await axios.get(`https://api.bilibili.com/x/player/playurl`, {
      params: {
        aid,
        cid,
        fnval: 16, // 获取DASH格式
        fnver: 0,
        fourk: 1
      },
      headers: {
        'Cookie': `SESSDATA=${ctx.cookies.get('SESSDATA')}`,
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.bilibili.com'
      }
    });

    ctx.body = response.data;
  } catch (error) {
    console.error('获取音频流URL失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '获取音频流URL失败' };
  }
});

module.exports = router;
