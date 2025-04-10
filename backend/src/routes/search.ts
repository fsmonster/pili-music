import express, { Request, Response } from 'express';
import axios from 'axios';
import { buildWbiUrl } from '../utils/wbi.js';

export interface SearchParams {
    keyword: string;
    page: number;
    page_size: number;
    order: string;
    order_type: string;
    type: string;
    wts: number;
    w_rid: string;
}

const router = express.Router();

/**
 * 搜索接口
 * @route GET /api/search
 * @param {SearchParams} params - 搜索参数
 * @returns {Object} 搜索结果
 * @access Public - 不需要登录
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const params = req.query;
        if (!params.keyword) {
            return res.status(400).json({ error: '缺少搜索关键词' });
        }

        // buvid3、buvid4
        const { buvid3 } = req.cookies;

        const url = await buildWbiUrl('https://api.bilibili.com/x/web-interface/wbi/search/type', params);
        
        // 调用 B 站搜索 API
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                'Referer': 'https://www.bilibili.com/',
                'Cookie': `buvid3=${buvid3}`
            }
        });
        
        if (response.data.code !== 0) {
            return res.status(500).json({ error: '搜索失败' });
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('搜索失败:', error);
        res.status(500).json({ error: '搜索失败' });
    }
});

export default router;
