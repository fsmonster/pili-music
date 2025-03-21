
/**
 * 获取请求头
 * @param sessdata SESSDATA
 * @returns 
 */
export function getHeaders(sessdata?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://www.bilibili.com'
    };
  
    if (sessdata) {
      headers['Cookie'] = `SESSDATA=${sessdata}`;
    }
  
    return headers;
  }
  