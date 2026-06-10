# Pikpak API 能力清单 & 测试覆盖

> 基于 `src/PikpakApi.ts` 源码分析，与实际 HTTP 响应对照
>
> 最后更新：2026-06-11

---

## 目录

1. [API 总览](#1-api-总览)
2. [读操作（安全）](#2-读操作安全)
3. [写操作](#3-写操作)
4. [测试覆盖矩阵](#4-测试覆盖矩阵)
5. [HTTP 接口索引](#5-http-接口索引)
6. [后续维护流程](#6-后续维护流程)

---

## 1. API 总览

当前 `PikpakApi` 类共公开 **26 个方法**（不含 `setDeviceId`），按 HTTP 方法分类：

| 分类 | 数量 | 方法列表 |
|------|------|---------|
| **GET（读，安全）** | 8 | `getQuotaInfo`, `getVipInfo`, `getTransferQuota`, `getInviteCode`, `fileList`, `fileStarList`, `events`, `offlineList` |
| **POST（写）** | 12 | `createFolder`, `deleteToTrash`, `untrash`, `deleteForever`, `offlineDownload`, `offlineTaskRetry`, `fileBatchMove`, `fileBatchCopy`, `fileBatchStar`, `fileBatchUnstar`, `fileBatchShare`, `captchaInit` |
| **PATCH（写）** | 1 | `fileRename` |
| **DELETE（写）** | 1 | `deleteTasks` |
| **组合方法** | 4 | `getTaskStatus`, `pathToId`, `fileMoveOrCopyByPath`, `offlineFileInfo` |
| **认证（特殊）** | 2 | `login`, `refreshAccessToken` |

---

## 2. 读操作（安全）

全部为 GET 请求，不修改任何数据，可安全调用。

### 2.1 getQuotaInfo

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:791` |
| **HTTP** | `GET https://api-drive.mypikpak.com/drive/v1/about` |
| **参数** | 无 |
| **响应类型** | `Promise<any>` → 建议改为 `Promise<QuotaInfo>` |
| **`model.ts` 类型** | ❌ 缺失 |
| **测试覆盖** | ✅ 已覆盖在 `test-quota.js` 和 `api-snapshot.js` |

**实测响应结构（2026-06-11）：**

```json
{
  "kind": "drive#about",
  "quota": {
    "kind": "drive#quota",
    "limit": "10995116277760",        // 总上限，string，10 TB
    "usage": "5398174124652",         // 已用量，string，~4.91 TB
    "usage_in_trash": "666870119",    // 回收站占用，string，~636 MB
    "is_unlimited": false,
    "complimentary": "0"
  },
  "quotas": {
    "cloud_download": {
      "kind": "",
      "limit": "-1",
      "usage": "0",
      "usage_in_trash": "0",
      "is_unlimited": true,
      "complimentary": "0"
    }
  },
  "expires_at": "",
  "user_type": 1
}
```

### 2.2 getVipInfo

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:813` |
| **HTTP** | `GET https://api-drive.mypikpak.com/drive/v1/privilege/vip` |
| **参数** | 无 |
| **响应类型** | `Promise<any>` |
| **`model.ts` 类型** | ❌ 缺失 |

### 2.3 getTransferQuota

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:824` |
| **HTTP** | `GET https://api-drive.mypikpak.com/vip/v1/quantity/list?type=transfer` |
| **参数** | 无（query 固定 `type=transfer`） |
| **响应类型** | `Promise<any>` |
| **`model.ts` 类型** | ❌ 缺失 |

### 2.4 getInviteCode

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:802` |
| **HTTP** | `GET https://api-drive.mypikpak.com/vip/v1/activity/inviteCode` |
| **参数** | 无 |
| **响应类型** | `Promise<string>`（唯一一个返回值非 any 的方法） |
| **`model.ts` 类型** | ❌ 缺失 |

### 2.5 fileList

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:414` |
| **HTTP** | `GET https://api-drive.mypikpak.com/drive/v1/files` |
| **参数** | `size`, `parentId`, `nextPageToken`, `additionalFilters`（全部可选） |
| **响应类型** | `Promise<FileList>`（唯一有类型定义的方法） |
| **`model.ts` 类型** | ✅ `FileList` + `file` 已定义 |

### 2.6 fileStarList

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:748` |
| **HTTP** | `GET https://api-drive.mypikpak.com/drive/v1/files`（带 `system_tag: {in: "STAR"}` 过滤） |
| **参数** | `size`, `nextPageToken`（全部可选） |
| **响应类型** | `Promise<any>`（内部调用 `FileList`） |
| **`model.ts` 类型** | ✅ 同 `fileList` |

### 2.7 events

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:445` |
| **HTTP** | `GET https://api-drive.mypikpak.com/drive/v1/events` |
| **参数** | `size`, `nextPageToken`（全部可选） |
| **响应类型** | `Promise<any>` |
| **`model.ts` 类型** | ❌ 缺失 |

### 2.8 offlineList

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/PikpakApi.ts:350` |
| **HTTP** | `GET https://api-drive.mypikpak.com/drive/v1/tasks` |
| **参数** | `size`, `nextPageToken`, `phase`（全部可选） |
| **响应类型** | `Promise<any>` |
| **`model.ts` 类型** | ❌ 缺失 |

### 2.9 辅助读方法（组合调用）

| 方法 | 代码位置 | 说明 |
|------|---------|------|
| `getTaskStatus(taskId, fileId)` | `:374` | 组合 `offlineList` + `offlineFileInfo`，返回枚举 |
| `offlineFileInfo(fileId)` | `:400` | `GET /drive/v1/files/{fileId}`，需真实 fileId |
| `getDownloadUrl(fileId)` | `:681` | `GET /drive/v1/files/{fileId}`，需真实 fileId |
| `getUserInfo()` | `:242` | 纯内存读取，无网络请求 |

---

## 3. 写操作

所有写操作默认 **跳过自动测试**，仅在 `api-snapshot.js` 中在安全测试文件夹内选择性测试。

### 3.1 安全级别说明

| 级别 | 标签 | 说明 | 自动测试 |
|------|------|------|---------|
| 🔵 低 | LOW | 无副作用，或仅影响测试专用文件夹 | ✅ |
| 🟡 中 | MEDIUM | 可能影响数据但可恢复（回收站） | ✅（仅在安全文件夹） |
| 🔴 高 | HIGH | 不可恢复/消耗资源 | ❌ 跳过 |

### 3.2 写操作清单

| # | 方法 | 代码位置 | HTTP | 安全级 | 能否在安全文件夹测试 |
|---|------|---------|------|--------|-------------------|
| 1 | `createFolder` | `:264` | `POST /drive/v1/files` | 🔵 低 | ✅ 创建到测试文件夹 |
| 2 | `fileRename` | `:694` | `PATCH /drive/v1/files/{id}` | 🔵 低 | ✅ 改测试文件夹内文件 |
| 3 | `fileBatchStar` | `:715` | `POST /drive/v1/files:star` | 🔵 低 | ✅ 加完可取消 |
| 4 | `fileBatchUnstar` | `:731` | `POST /drive/v1/files:unstar` | 🔵 低 | ✅ |
| 5 | `fileBatchCopy` | `:617` | `POST /drive/v1/files:batchCopy` | 🔵 低 | ✅ 复制到测试文件夹 |
| 6 | `fileBatchMove` | `:596` | `POST /drive/v1/files:batchMove` | 🟡 中 | ✅ 仅在测试文件夹内移动 |
| 7 | `deleteToTrash` | `:280` | `POST /drive/v1/files:batchTrash` | 🟡 中 | ✅ 可恢复，最后清理 |
| 8 | `untrash` | `:294` | `POST /drive/v1/files:batchUntrash` | 🟡 中 | ✅ 恢复回收站 |
| 9 | `deleteForever` | `:308` | `POST /drive/v1/files:batchDelete` | 🔴 高 | ❌ 不可恢复 |
| 10 | `offlineDownload` | `:324` | `POST /drive/v1/files` | 🔴 高 | ❌ 消耗下载配额 |
| 11 | `offlineTaskRetry` | `:462` | `POST /drive/v1/task` | 🔴 高 | ❌ 影响真实任务 |
| 12 | `deleteTasks` | `:484` | `DELETE /drive/v1/tasks` | 🔴 高 | ❌ 影响真实任务 |
| 13 | `fileBatchShare` | `:769` | `POST /drive/v1/share` | 🔴 高 | ❌ 生成公开分享链接 |

### 3.3 认证相关（特殊）

| 方法 | 代码位置 | 说明 | 自动测试 |
|------|---------|------|---------|
| `captchaInit` | `:166` | 初始化验证码，POST | ❌ 用户手动提供凭证 |
| `login` | `:184` | 用户名密码登录，POST | ❌ 用户指定不测试 |
| `refreshAccessToken` | `:219` | 刷新令牌，POST | ❌ 用户指定不测试 |

---

## 4. 测试覆盖矩阵

### 4.1 测试文件

| 文件 | 说明 |
|------|------|
| `tests/api-snapshot.js` | **主测试脚本**，覆盖全部读 + 安全写操作 |
| `test-quota.js` | 快速验证 `getQuotaInfo` 的工具（早期版本） |

### 4.2 覆盖明细

| 方法 | 测试覆盖 | 测试脚本中对应步骤 |
|------|---------|-------------------|
| `getQuotaInfo` | ✅ | 读测试 #1 |
| `getVipInfo` | ✅ | 读测试 #2 |
| `getTransferQuota` | ✅ | 读测试 #3 |
| `getInviteCode` | ✅ | 读测试 #4 |
| `fileList` | ✅ | 读测试 #5 |
| `fileStarList` | ✅ | 读测试 #6 |
| `events` | ✅ | 读测试 #7 |
| `offlineList` | ✅ | 读测试 #8 |
| `createFolder` | ✅ | 写测试步骤 1-3 |
| `fileRename` | ✅ | 写测试步骤 4 |
| `fileBatchStar` | ✅ | 写测试步骤 5 |
| `fileBatchUnstar` | ✅ | 写测试步骤 6 |
| `fileBatchCopy` | ✅ | 写测试步骤 7 |
| `deleteToTrash` | ✅ | 写测试步骤 8、10 |
| `untrash` | ✅ | 写测试步骤 9 |
| `offlineFileInfo` | ⚠️ 手动 | 需要真实 fileId，未纳入自动测试 |
| `getDownloadUrl` | ⚠️ 手动 | 需要真实 fileId，未纳入自动测试 |
| `getTaskStatus` | ⚠️ 手动 | 需要真实 taskId，未纳入自动测试 |
| `pathToId` | ⚠️ 手动 | 组合方法，未单独测试 |
| `fileMoveOrCopyByPath` | ⚠️ 手动 | 组合方法，未单独测试 |
| `fileBatchMove` | ⚠️ 手动 | 在安全文件夹内测试较复杂，暂未纳入 |
| `deleteForever` | ❌ 跳过 | 不可恢复 |
| `offlineDownload` | ❌ 跳过 | 消耗下载配额 |
| `offlineTaskRetry` | ❌ 跳过 | 影响真实任务 |
| `deleteTasks` | ❌ 跳过 | 影响真实任务 |
| `fileBatchShare` | ❌ 跳过 | 生成公开分享链接 |
| `captchaInit` | ❌ 跳过 | 认证流程 |
| `login` | ❌ 跳过 | 认证流程 |
| `refreshAccessToken` | ❌ 跳过 | 认证流程 |

### 4.3 覆盖统计

| 分类 | 总计 | 已覆盖 | 未覆盖 | 覆盖率 |
|------|------|--------|--------|--------|
| 读操作（GET） | 8 | 8 | 0 | **100%** |
| 写操作（LOW） | 5 | 5 | 0 | **100%** |
| 写操作（MEDIUM） | 3 | 2 | 1 (`fileBatchMove`) | **67%** |
| 写操作（HIGH） | 5 | 0 | 5 | **0%**（设计如此） |
| **总计（有效）** | **16** | **15** | **1** | **94%** |

> "有效"指去掉 🔴 高危险和认证类（共 7 个）后的可测试 API 数量。

---

## 5. HTTP 接口索引

按 URL 路径排序的完整接口索引。

```
POST   /v1/auth/signin                              login                          认证
POST   /v1/auth/token                               refreshAccessToken             认证
POST   /v1/shield/captcha/init                      captchaInit                    认证

GET    /drive/v1/about                              getQuotaInfo                   读 ✅
GET    /drive/v1/events                             events                         读 ✅
GET    /drive/v1/files                              fileList                       读 ✅
GET    /drive/v1/files(*)                           fileStarList                   读 ✅
GET    /drive/v1/files/{fileId}                     offlineFileInfo / getDownload  读 ⚠️
POST   /drive/v1/files                              createFolder / offlineDownload 写 ✅/❌
PATCH  /drive/v1/files/{id}                         fileRename                     写 ✅
POST   /drive/v1/files:batchCopy                    fileBatchCopy                  写 ✅
POST   /drive/v1/files:batchMove                    fileBatchMove                  写 ⚠️
POST   /drive/v1/files:batchTrash                   deleteToTrash                  写 ✅
POST   /drive/v1/files:batchUntrash                 untrash                        写 ✅
POST   /drive/v1/files:batchDelete                  deleteForever                  写 ❌
POST   /drive/v1/files:star                         fileBatchStar                  写 ✅
POST   /drive/v1/files:unstar                       fileBatchUnstar                写 ✅
GET    /drive/v1/tasks                              offlineList                    读 ✅
POST   /drive/v1/task                               offlineTaskRetry               写 ❌
DELETE /drive/v1/tasks                              deleteTasks                    写 ❌
POST   /drive/v1/share                              fileBatchShare                 写 ❌
GET    /drive/v1/privilege/vip                      getVipInfo                     读 ✅

GET    /vip/v1/activity/inviteCode                  getInviteCode                  读 ✅
GET    /vip/v1/quantity/list                        getTransferQuota               读 ✅
```

---

## 6. 后续维护流程

### 6.1 检测 API 变更

```bash
# 运行快照测试（需要有效的 .pikpak-token.json）
node tests/api-snapshot.js
```

输出结果保存在 `tests/data/`，每个 API 一个 JSON 文件。

### 6.2 与历史数据对比

将新运行的数据与历史数据对比，重点关注：

1. **schema 变化** — 每个 JSON 文件中的 `schema` 字段记录了所有字段的路径和类型
2. **新增字段** — 文件中出现历史数据中没有的字段路径
3. **删除字段** — 历史数据中有但新数据中没有的字段路径
4. **类型变化** — 同一字段的类型从 `string` 变为 `number` 等

### 6.3 变化处理策略

| 变化类型 | 影响 | 处理方式 |
|---------|------|---------|
| 新增**可选**字段 | 无影响，代码兼容 | 在 `model.ts` 中补充类型定义 |
| 新增**必填**字段 | 如果代码不读取则无影响 | 按需补充 |
| 字段**改名** | ⚠️ 代码中引用该字段的地方需要更新 | 需要更新 `PikpakApi.ts` 中的逻辑 |
| 字段**类型**变化 | ⚠️ 如 `string`→`number`，需更新类型和逻辑 | 更新 `model.ts` + 调用方 |
| 字段**删除** | ⚠️ 代码中引用该字段会返回 `undefined` | 更新逻辑或迁移到新字段 |
| 端点 URL 变化 | 🔴 需要更新 `PikpakApi.ts` 中的 URL 常量 | 更新后全面回归测试 |
| 认证方式变化 | 🔴 需要重写认证逻辑 | 需要更新 `login` / `refreshAccessToken` |

### 6.4 推荐的工具链

```
当前状态: 零测试, any泛滥, 无类型定义
    │
    ▼
第一步: 补齐 model.ts 类型定义（消除 any）
    │
    ▼
第二步: 引入 zod schema 验证（运行时检测变化）
    │
    ▼
第三步: 写契约测试, 定期运行 api-snapshot.js
    │
    ▼
第四步: CI 集成 + 版本发布流程
```
