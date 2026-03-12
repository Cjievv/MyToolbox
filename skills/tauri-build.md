# MyToolbox - Tauri Mac App 打包发布流程

## 概述

此 skill 定义了 MyToolbox 项目的标准打包发布流程，确保版本号一致、构建规范、产物完整。

## 项目信息

- **项目名称**: MyToolbox
- **当前版本**: 0.1.0
- **技术栈**: Tauri 2.x + React + TypeScript
- **目标平台**: macOS (Apple Silicon)
- **输出格式**: .app 和 .dmg

## 版本号文件位置

必须同步更新以下3个文件的版本号：

| 文件 | 当前版本 | 字段 |
|------|----------|------|
| `package.json` | 0.1.0 | `"version": "0.1.0"` |
| `src-tauri/tauri.conf.json` | 0.1.0 | `"version": "0.1.0"` |
| `src-tauri/Cargo.toml` | 0.1.0 | `version = "0.1.0"` |

## 打包前准备

### 1. 环境检查

```bash
# 检查 Rust 环境
rustc --version
cargo --version

# 检查 Tauri CLI
export PATH="$HOME/.cargo/bin:$PATH"
cargo tauri --version

# 检查 Node.js 依赖
npm install
```

### 2. 版本号更新

**必须同步更新以下3个文件的版本号：**

| 文件 | 字段 | 说明 |
|------|------|------|
| `package.json` | `version` | npm 包版本 |
| `src-tauri/tauri.conf.json` | `version` | Tauri 应用版本 |
| `src-tauri/Cargo.toml` | `version` | Rust crate 版本 |

**版本号规范**：遵循语义化版本 (SemVer)
- 主版本号.次版本号.修订号 (如：1.2.3)
- 开发阶段可用：0.1.0, 0.2.0 等

**更新示例（从 1.0.0 到 1.1.0）：**

```bash
# package.json: "version": "1.1.0"
# src-tauri/tauri.conf.json: "version": "1.1.0"
# src-tauri/Cargo.toml: version = "1.1.0"
```

## 标准打包流程

### 步骤 1: 版本一致性检查

```bash
# 读取当前版本号
echo "=== 当前版本号 ==="
grep '"version"' package.json | head -1
grep '"version"' src-tauri/tauri.conf.json | head -1
grep '^version' src-tauri/Cargo.toml | head -1
```

确认3个文件的版本号完全一致，如不一致请先统一更新。

### 步骤 2: TypeScript 类型检查与构建

```bash
# 执行类型检查并构建前端
npm run build
```

**成功标志：**
- 无 TypeScript 错误
- 输出：`dist/index.html` 及相关资源文件

### 步骤 3: 图标检查

确保图标文件存在：

```bash
ls -la src-tauri/icons/
```

**必需文件：**
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (macOS)
- icon.ico (Windows)

**如缺失，创建占位图标：**
```bash
node -e "
const fs = require('fs');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('src-tauri/icons/32x32.png', png);
fs.writeFileSync('src-tauri/icons/128x128.png', png);
fs.writeFileSync('src-tauri/icons/128x128@2x.png', png);
fs.writeFileSync('src-tauri/icons/icon.icns', png);
fs.writeFileSync('src-tauri/icons/icon.ico', png);
console.log('Icons created');
"
```

### 步骤 4: Tauri 构建

```bash
# 加载 Rust 环境并执行构建
export PATH="$HOME/.cargo/bin:$PATH"
npm run tauri:build
```

**构建过程：**
1. 编译 Rust 后端 (release 模式)
2. 生成 .app 应用包
3. 生成 .dmg 安装包

**成功标志：**
```
Finished `release` profile [optimized]
Bundling MyToolbox.app
Bundling MyToolbox_0.1.0_aarch64.dmg
Finished 2 bundles at:
    .../src-tauri/target/release/bundle/macos/MyToolbox.app
    .../src-tauri/target/release/bundle/dmg/MyToolbox_0.1.0_aarch64.dmg
```

### 步骤 5: 产物验证

```bash
# 检查构建产物
ls -lh src-tauri/target/release/bundle/macos/
ls -lh src-tauri/target/release/bundle/dmg/

# 验证 .app 可运行
open src-tauri/target/release/bundle/macos/MyToolbox.app
```

## 产物说明

### 输出路径

```
src-tauri/target/release/bundle/
├── macos/
│   └── MyToolbox.app              # Mac 应用包（可直接运行）
└── dmg/
    └── MyToolbox_0.1.0_aarch64.dmg # 安装包（用于分发）
```

### 文件用途

| 文件 | 用途 | 大小 | 分发方式 |
|------|------|------|----------|
| MyToolbox.app | 可直接运行的应用 | ~10MB | 压缩为 zip 分发 |
| MyToolbox_0.1.0_aarch64.dmg | 磁盘映像安装包 | ~5MB | 直接下载安装 |

## 完整打包命令（一键执行）

```bash
#!/bin/bash
set -e

echo "=== Tauri Mac App 打包流程 ==="

# 1. 加载环境
export PATH="$HOME/.cargo/bin:$PATH"

# 2. 显示当前版本
echo ""
echo "当前版本:"
grep '"version"' package.json | head -1
grep '"version"' src-tauri/tauri.conf.json | head -1
grep '^version' src-tauri/Cargo.toml | head -1

# 3. 安装依赖
echo ""
echo "安装依赖..."
npm install

# 4. 构建前端
echo ""
echo "构建前端..."
npm run build

# 5. 检查图标
echo ""
echo "检查图标..."
for icon in 32x32.png 128x128.png 128x128@2x.png icon.icns icon.ico; do
    if [ ! -f "src-tauri/icons/$icon" ]; then
        echo "创建占位图标: $icon"
        node -e "const fs=require('fs'); fs.writeFileSync('src-tauri/icons/$icon', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));"
    fi
done

# 6. Tauri 构建
echo ""
echo "构建 Tauri 应用..."
npm run tauri:build

# 7. 验证产物
echo ""
echo "构建完成！产物列表:"
ls -lh src-tauri/target/release/bundle/macos/
ls -lh src-tauri/target/release/bundle/dmg/

echo ""
echo "=== 打包成功 ==="
```

## 常见问题

### 1. Rust 环境未找到

**错误：** `command not found: cargo`

**解决：**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

### 2. 图标文件缺失

**错误：** `resource path 'icons/XXX.png' doesn't exist`

**解决：** 运行上述图标创建命令生成占位图标。

### 3. 类型检查失败

**错误：** TypeScript 编译错误

**解决：** 修复类型错误后再构建，或检查 `src/components/Editor/MonacoWrapper.tsx` 等文件的类型定义。

### 4. 版本号不一致

**警告：** 不同文件的版本号不匹配

**解决：** 手动同步 `package.json`、`tauri.conf.json`、`Cargo.toml` 中的版本号。

### 5. 窗口无法拖动

**现象：** 应用窗口无法通过标题栏拖动

**原因：** `tauri.conf.json` 中的 `titleBarStyle` 配置为 `Overlay` 时可能与内容区域冲突

**解决：** 将 `titleBarStyle` 改为 `Transparent`

```json
{
  "app": {
    "windows": [
      {
        "decorations": true,
        "titleBarStyle": "Transparent"
      }
    ]
  }
}
```

**推荐配置：**
- `Visible` - 标准标题栏（可拖动，有按钮）
- `Transparent` - 透明标题栏（可拖动，美观）
- **避免使用 `Overlay`** - 可能遮挡拖动区域

## 发布检查清单

- [ ] 版本号已更新（3个文件一致）
- [ ] npm install 完成
- [ ] TypeScript 无错误
- [ ] 前端构建成功
- [ ] 图标文件完整
- [ ] Tauri 构建成功
- [ ] .app 可正常运行
- [ ] .dmg 文件生成
- [ ] 测试安装流程

## 版本升级流程

### 1. 更新版本号

从 0.1.0 升级到 0.2.0：

```bash
# 1. 更新 package.json
# "version": "0.2.0"

# 2. 更新 src-tauri/tauri.conf.json
# "version": "0.2.0"

# 3. 更新 src-tauri/Cargo.toml
# version = "0.2.0"
```

### 2. 重新打包

```bash
export PATH="$HOME/.cargo/bin:$PATH"
npm run tauri:build
```

### 3. 产物验证

```bash
ls -lh src-tauri/target/release/bundle/dmg/
# MyToolbox_0.2.0_aarch64.dmg
```

### 4. Git 打标签

```bash
git add .
git commit -m "Release v0.2.0"
git tag -a v0.2.0 -m "Release version 0.2.0"
git push origin v0.2.0
```

### 5. 更新 GitHub Gist 版本信息

发布新版本后，必须更新 Gist 中的版本信息，否则其他设备无法收到更新提示。

#### Gist 链接

| 平台 | Gist 地址 |
|------|----------|
| macOS | https://gist.github.com/Cjievv/5ed754cc63118a08e2c56b04455f7799 |
| Windows | https://gist.github.com/Cjievv/3bbb8aa153afa570f0048db46cc59bb4 |

#### 更新步骤

1. 打开上述 Gist 链接
2. 点击 **"Edit"** 按钮
3. 修改 `version` 为新版本号（如 `"0.2.0"`）
4. 修改 `macUrl` 和 `windowsUrl` 为新版本的下载链接
5. 可选：更新 `releaseNotes` 说明更新内容
6. 点击 **"Update gist"** 保存

#### JSON 格式参考

```json
{
  "version": "0.2.0",
  "macUrl": "https://example.com/path/to/MyToolbox_0.2.0_aarch64.dmg",
  "windowsUrl": "https://example.com/path/to/MyToolbox_0.2.0_x64-setup.exe",
  "releaseNotes": "新增了 JSON 格式化功能，优化了界面性能"
}
```

#### 下载链接托管方案

推荐以下免费方案托管安装包：

| 方案 | 说明 |
|------|------|
| **GitHub Releases** | 打包后上传到 GitHub Release，复制下载链接 |
| **阿里云盘** | 上传安装包，生成分享链接 |
| **百度网盘** | 上传安装包，生成分享链接 |

#### 版本检测机制

应用启动时会自动检测新版本：
- 读取 Gist 中的 `latest-{platform}.json` 文件
- 对比当前应用版本号（package.json 中的 version）
- 如果有新版本，右下角弹窗提示用户下载

**注意**：每次发布新版本后务必更新 Gist，否则已分发的客户端无法感知新版本！

## 命名规范

**DMG 文件名：** `MyToolbox_{版本号}_aarch64.dmg`

历史版本示例：
- MyToolbox_0.1.0_aarch64.dmg ✅ 当前版本
- MyToolbox_0.2.0_aarch64.dmg
- MyToolbox_1.0.0_aarch64.dmg
