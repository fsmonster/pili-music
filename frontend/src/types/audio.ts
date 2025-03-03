// 音频流信息
export interface AudioStream {
    id: number;
    baseUrl: string;
    bandwidth: number;
    mimeType: string;
    codecs: string;
}