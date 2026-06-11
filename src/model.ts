import {
  DriveKind,
  FilePhase,
  FolderType,
  FileCategory,
  EventType,
  VipStatus,
  VipType,
  AuditStatus,
  UploadType,
} from "./enums";

// ============================================================
// 文件/文件夹基础类型
// ============================================================

/** 文件审计状态信息 */
export interface AuditInfo {
  /** 审计状态，如 "STATUS_OK" */
  status: AuditStatus;
  /** 审计消息，如 "Normal resource" */
  message: string;
  /** 审计标题 */
  title: string;
}

/**
 * 云盘文件/文件夹信息
 */
export interface DriveFile {
  /** 资源类型标识 */
  kind: DriveKind;
  /** 文件/文件夹唯一 ID */
  id: string;
  /** 父文件夹 ID，根目录为空字符串 */
  parent_id: string;
  /** 文件/文件夹名称 */
  name: string;
  /** 所属用户 ID */
  user_id: string;
  /** 文件大小（字节），使用 string 避免大数精度丢失 */
  size: string;
  /** 文件版本号 */
  revision: string;
  /** 文件扩展名（文件夹为空字符串） */
  file_extension: string;
  /** MIME 类型（文件夹为空字符串） */
  mime_type: string;
  /** 是否已收藏 */
  starred: boolean;
  /** Web 内容链接 */
  web_content_link: string;
  /** 创建时间（ISO 8601 格式，含时区） */
  created_time: string;
  /** 修改时间（ISO 8601 格式，含时区） */
  modified_time: string;
  /** 文件图标 URL */
  icon_link: string;
  /** 缩略图 URL */
  thumbnail_link: string;
  /** 文件 MD5 校验和 */
  md5_checksum: string;
  /** 文件内容哈希值 */
  hash: string;
  /** 文件链接信息 */
  links: Record<string, unknown>;
  /** 文件当前阶段状态 */
  phase: FilePhase;
  /** 文件审计信息（文件夹或无审计信息的文件完全省略此字段） */
  audit?: AuditInfo | null;
  /** 文件媒体信息列表 */
  medias: unknown[];
  /** 是否在回收站中 */
  trashed: boolean;
  /** 删除时间（ISO 8601 格式），未删除时为空字符串 */
  delete_time: string;
  /** 文件原始来源 URL */
  original_url: string;
  /**
   * 文件参数信息（键值对形式）
   * @desc 文件夹通常包含 platform_icon；视频文件还可能包含 duration、height、width、url（磁力链）等
   */
  params: Record<string, string>;
  /** 原始文件索引序号 */
  original_file_index: number;
  /** 文件空间标识 */
  space: string;
  /** 绑定的应用信息 */
  apps: unknown[];
  /** 当前用户是否可写 */
  writable: boolean;
  /** 文件夹类型 */
  folder_type: FolderType;
  /** 文件集合信息（仅部分场景存在） */
  collection?: unknown;
  /** 文件排序名称 */
  sort_name: string;
  /** 用户自定义修改时间（ISO 8601 格式） */
  user_modified_time: string;
  /** 文件名称拼写索引 */
  spell_name: string[];
  /** 文件分类 */
  file_category: FileCategory;
  /** 文件标签列表 */
  tags: unknown[];
  /** 文件关联事件列表 */
  reference_events: unknown[];
}

/** 文件列表响应（GET /drive/v1/files） */
export interface FileList {
  /** 列表类型，固定为 "drive#fileList" */
  kind: DriveKind.FileList;
  /** 下一页的分页令牌，最后一页为空字符串 */
  next_page_token: string;
  /** 文件列表 */
  files: DriveFile[];
  /** 版本信息，base64 编码的游标 */
  version: string;
  /** 当前版本是否已过时 */
  version_outdated: boolean;
  /** 同步时间（ISO 8601 格式） */
  sync_time: string;
}

// ============================================================
// 认证相关
// ============================================================

/** OAuth 令牌数据（用于序列化/反序列化） */
export interface TokenData {
  /** OAuth 访问令牌 */
  access_token: string;
  /** OAuth 刷新令牌 */
  refresh_token: string;
}

/** 文件路径 → ID 的缓存记录 */
export interface FileRecord {
  /** 文件夹/文件 ID */
  id: string;
  /** 文件夹/文件名称 */
  name: string;
  /** 资源类型，"folder" 表示文件夹，"file" 表示文件 */
  fileType: "folder" | "file";
}

// ============================================================
// 配额/用量 (drive/v1/about)
// ============================================================

/** 云盘配额明细 */
export interface Quota {
  /** 配额类型，主配额为 "drive#quota"，子配额（如 cloud_download）可能为空字符串 */
  kind: string;
  /** 总上限（字节），使用 string 避免大数精度丢失 */
  limit: string;
  /** 已用量（字节），使用 string 避免大数精度丢失 */
  usage: string;
  /** 回收站占用（字节） */
  usage_in_trash: string;
  /** 是否无限容量 */
  is_unlimited: boolean;
  /** 赠送容量（字节） */
  complimentary: string;
}

/** drive/v1/about 响应 — 云盘空间配额信息 */
export interface AboutResponse {
  /** 响应类型，固定为 "drive#about" */
  kind: DriveKind.About;
  /** 主存储配额 */
  quota: Quota;
  /** 子项配额集合 */
  quotas: {
    /** 云下载配额（不限容量时返回 is_unlimited=true） */
    cloud_download?: Quota;
  };
  /** 配额过期时间（ISO 8601 格式），空字符串表示不过期 */
  expires_at: string;
  /** 用户类型标识 */
  user_type: number;
}

// ============================================================
// VIP 信息 (drive/v1/privilege/vip)
// ============================================================

/** VIP 数据明细 */
export interface VipData {
  /** 会员过期时间（ISO 8601 格式） */
  expire: string;
  /** VIP 订阅状态 */
  status: VipStatus;
  /** VIP 会员类型 */
  type: VipType;
  /** 用户 ID */
  user_id: string;
}

/** drive/v1/privilege/vip 响应 — VIP 信息 */
export interface VipResponse {
  /** 处理结果，如 "ACCEPTED" */
  result: string;
  /** 响应消息 */
  message: string;
  /** 重定向 URI */
  redirect_uri: string;
  /** VIP 数据 */
  data: VipData;
}

// ============================================================
// 传输配额 (vip/v1/quantity/list?type=transfer)
// ============================================================

/** 传输配额单项明细 */
export interface TransferQuotaDetail {
  /** 配额说明信息（transfer 摘要层级存在，base 详情层级可能缺失） */
  info?: string;
  /** 总配额度（条数或字节数，取决于所处层级） */
  total_assets: number;
  /** 已使用量 */
  assets: number;
  /** 当前使用字节数（base 层级始终存在，transfer 摘要层级不存在） */
  size?: number;
}

/** 传输配额基础信息 */
export interface TransferQuotaBase {
  /** 用户 ID */
  user_id: string;
  /** 基础信息说明 */
  info: string;
  /** 订阅状态标识 */
  sub_status: boolean;
  /** VIP 状态 */
  vip_status: VipStatus;
  /** 会员过期时间（ISO 8601 格式） */
  expire_time: string;
  /** 可读的配额总量，如 "10T" */
  assets: string;
  /** 当前总使用字节数 */
  size: number;
  /** 离线下载配额详情 */
  offline: TransferQuotaDetail;
  /** 下载配额详情 */
  download: TransferQuotaDetail;
  /** 上传配额详情 */
  upload: TransferQuotaDetail;
  /** 每日下载配额详情 */
  download_daily: TransferQuotaDetail;
}

/** vip/v1/quantity/list?type=transfer 响应 — 传输配额信息 */
export interface TransferQuotaResponse {
  /** 传输配额摘要（仅含配额的条数维度，不含字节明细） */
  transfer: {
    offline: TransferQuotaDetail;
    download: TransferQuotaDetail;
    upload: TransferQuotaDetail;
  };
  /** 扩展数据 */
  data: null | Record<string, unknown>;
  /** 是否还有更多数据 */
  has_more: boolean;
  /** 传输配额基础详情（含字节大小等完整信息） */
  base: TransferQuotaBase;
}

// ============================================================
// 事件 (drive/v1/events)
// ============================================================

/**
 * 事件中的引用资源（文件快照）
 * @desc 事件或任务中携带的文件状态快照，结构上为 DriveFile 的子集
 */
export interface ReferenceResource {
  /** 资源类型标识，固定为 "type.googleapis.com/drive.ReferenceFile" */
  "@type": "type.googleapis.com/drive.ReferenceFile";
  /** 资源类型 */
  kind: DriveKind;
  /** 文件 ID */
  id: string;
  /** 父文件夹 ID */
  parent_id: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: string;
  /** MIME 类型 */
  mime_type: string;
  /** 图标链接 */
  icon_link: string;
  /** 文件内容哈希值 */
  hash: string;
  /** 文件阶段状态 */
  phase: FilePhase;
  /** 文件审计信息（事件场景中存在，任务场景可能缺失） */
  audit?: AuditInfo;
  /** 缩略图链接 */
  thumbnail_link: string;
  /** 文件参数信息（视频文件含 duration / height / width / url 等） */
  params: Record<string, string>;
  /** 文件空间标识 */
  space: string;
  /** 媒体信息列表 */
  medias: unknown[];
  /** 是否已收藏 */
  starred: boolean;
  /** 标签列表 */
  tags: unknown[];
  /** 创建时间（ISO 8601 格式） */
  created_time: string;
  /** 修改时间（ISO 8601 格式） */
  modified_time: string;
}

/** 事件项 */
export interface EventItem {
  /** 事件类型，固定为 "drive#event" */
  kind: DriveKind.Event;
  /** 事件操作分类 */
  type: EventType;
  /** 事件分类可读名称，如 "Add" */
  type_name: string;
  /** 事件来源 */
  source: string;
  /** 事件主题 */
  subject: string;
  /** 触发事件的设备标识 */
  device: string;
  /** 事件唯一 ID */
  id: string;
  /** 事件创建时间（ISO 8601 格式） */
  created_time: string;
  /** 关联文件的 MIME 类型 */
  mime_type: string;
  /** 关联文件 ID */
  file_id: string;
  /** 关联文件名称 */
  file_name: string;
  /** 文件图标 URL */
  icon_url: string;
  /** 事件扩展参数 */
  params: Record<string, unknown>;
  /** 事件更新时间（ISO 8601 格式） */
  updated_time: string;
  /** 关联文件所在文件夹 ID */
  folder_id: string;
  /** 事件标签，如 "wide" */
  label: string;
  /** 事件进度（始终为 0） */
  progress: number;
  /** 引用资源（文件快照），事件触发时包含 */
  reference_resource?: ReferenceResource;
  /** 文件空间标识 */
  space: string;
}

/** drive/v1/events 响应 — 最近活动事件列表 */
export interface EventsResponse {
  /** 下一页的分页令牌 */
  next_page_token: string;
  /** 事件列表 */
  events: EventItem[];
}

// ============================================================
// 任务 (drive/v1/tasks)
// ============================================================

/** 离线下载任务项 */
export interface TaskItem {
  /** 任务资源类型，固定为 "drive#task" */
  kind: DriveKind.Task;
  /** 任务唯一 ID */
  id: string;
  /** 任务名称（即下载文件名） */
  name: string;
  /** 任务类型，固定为 "offline" */
  type: "offline";
  /** 创建任务的用户 ID */
  user_id: string;
  /** 内部状态列表 */
  statuses: unknown[];
  /** 状态项数量 */
  status_size: number;
  /**
   * 任务参数
   * @desc 包含 age（毫秒，任务已存在时间）、url（原始下载链接）等
   */
  params: Record<string, string>;
  /** 文件 ID，任务未完成时可能为空字符串 */
  file_id: string;
  /** 文件名 */
  file_name: string;
  /** 文件大小（字节），使用 string 避免大数精度丢失 */
  file_size: string;
  /** 状态描述信息，错误时包含错误原因，如 "Storage space is not enough" */
  message: string;
  /** 任务创建时间（ISO 8601 格式） */
  created_time: string;
  /** 任务更新时间（ISO 8601 格式） */
  updated_time: string;
  /** 第三方任务 ID */
  third_task_id: string;
  /** 任务阶段状态 */
  phase: FilePhase;
  /** 下载进度百分比（0-100） */
  progress: number;
  /** 文件图标链接 */
  icon_link: string;
  /** 回调地址 */
  callback: string;
  /** 引用资源（文件快照），请求携带 ?with=reference_resource 时返回 */
  reference_resource?: ReferenceResource | null;
  /** 文件空间标识 */
  space: string;
}

/** drive/v1/tasks 响应 — 任务列表 */
export interface TaskListResponse {
  /** 任务列表 */
  tasks: TaskItem[];
  /** 下一页的分页令牌，最后一页为空字符串 */
  next_page_token: string;
  /** 分页令牌有效时长（秒） */
  expires_in?: number;
}

// ============================================================
// 写操作相关响应类型
// ============================================================

/** 创建文件夹/文件的响应（POST /drive/v1/files） */
export interface CreateFileResponse {
  /** 上传类型 */
  upload_type: UploadType;
  /** 创建的文件/文件夹对象 */
  file: DriveFile;
}

/** 批量收藏响应（POST /drive/v1/files:star） */
export interface StarResponse {
  /** 操作影响的文件 ID 列表 */
  ids: string[];
}

/**
 * 返回 task_id 的批量操作响应
 * @desc 用于 batchCopy、batchTrash、batchUntrash 等操作
 */
export interface TaskActionResponse {
  /** 后台处理任务的 ID */
  task_id: string;
}

/** 邀请码响应（GET /vip/v1/activity/inviteCode） */
export interface InviteCodeResponse {
  /** 用户邀请码 */
  code: string;
}
