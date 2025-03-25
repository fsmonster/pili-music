/**
 * B站用户信息接口（仅保留必要字段）
 * 从B站API获取的原始用户数据结构
 */
export interface BiliUserInfo {
    isLogin: boolean  // 登录状态
    face: string      // 头像URL
    mid: number       // 用户ID
    uname: string     // 用户名
}

/**
 * 本地存储的精简用户状态
 * 只保存必要的用户信息，减少存储空间占用
 */
export interface UserInfo {
    isLoggedIn: boolean
    userInfo: {
        avatar: string    // 经过处理的头像URL（已转换为代理URL）
        username: string  // 用户名
        mid: number      // 用户ID
    } | null
}

/**
 * B站up主信息接口响应
 */
export interface UpInfoCardResponse {
    archive_count: number;
    article_count: number;
    card: UpInfoCard;
    follower: number;
    following: boolean;
    like_num: number;
    [property: string]: any;
}

/**
 * B站up主信息接口
 */
export interface UpInfoCard extends Upper {
    approve: boolean; // 是否通过审核
    article: number; // 文章数量
    attention: number; // 关注的用户数
    attentions: string[]; // 关注的用户 mid 列表
    birthday: string; // 生日（格式：MM-DD）
    description: string; // 个人简介
    DisplayRank: string; // 显示的等级排名
    face_nft: number; // 是否是 NFT 头像（0：否，1：是）
    face_nft_type: number; // NFT 头像类型
    fans: number; // 粉丝数
    friend: number; // 互相关注数
    is_senior_member: number; // 是否是高阶会员（1：是，0：否）
    level_info: any; // 用户等级信息
    name_render: null; // 可能用于存储用户名的额外渲染信息，当前为 null
    nameplate: any; // 勋章信息（具体结构未知，使用 any）
    Official: any; // 认证信息（结构可能复杂，使用 any）
    official_verify: any; // 旧版认证信息（已废弃，使用 any）
    pendant: any; // 头像挂件信息（使用 any）
    place: string; // 可能表示位置信息（目前一般为空）
    rank: string; // 排名信息（官方已废弃）
    regtime: number; // 注册时间（Unix 时间戳）
    sex: string; // 性别（男/女/保密）
    sign: string; // 个性签名
    spacesta: number; // 主页状态（0：正常，-2：封禁）
    vip: any; // 会员信息（可能包含大会员、年度大会员等信息，使用 any）
    [property: string]: any; // 允许额外的未知字段
}

export interface Upper {
    mid: number;
    name: string;
    face: string;
}
