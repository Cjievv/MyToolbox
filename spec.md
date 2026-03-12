# MyToolBox 开发工具集 - 功能需求规范

## 1. 项目概述

**项目名称**: MyToolBox - 开发者工具集
**项目类型**: Web 应用 (React + TypeScript + Vite)
**核心功能**: 为开发者提供常用工具的在线使用，包括 JSON 处理、文本对比、SQL 格式化、Markdown 编辑、文件格式转换等
**目标用户**: 软件开发人员、测试工程师、技术文档编写者

---

## 2. UI/UX 规范

### 2.1 布局结构

- **整体布局**: 左侧固定侧边栏 + 右侧主内容区域
- **侧边栏宽度**: 200px
- **侧边栏内容**: 工具导航列表 + 底部设置入口
- **响应式设计**: 侧边栏可折叠（移动端）

### 2.2 视觉设计

**配色方案** (CSS Variables):
- `--bg-primary`: #ffffff (主背景)
- `--bg-secondary`: #f8f9fa (次级背景)
- `--bg-tertiary`: #e9ecef (三级背景)
- `--bg-sidebar`: #ffffff (侧边栏背景)
- `--bg-sidebar-hover`: #f1f3f5 (侧边栏悬停)
- `--text-primary`: #212529 (主文字)
- `--text-secondary`: #495057 (次级文字)
- `--text-tertiary`: #868e96 (三级文字)
- `--accent-primary`: #4a90e2 (主强调色-蓝色)
- `--accent-success`: #40c057 (成功色-绿色)
- `--accent-warning`: #fab005 (警告色-黄色)
- `--accent-danger`: #ff6b6b (错误色-红色)
- `--accent-info`: #339af0 (信息色-浅蓝)
- `--border-color`: #dee2e6 (边框色)
- `--border-light`: #f1f3f5 (浅边框)
- `--sidebar-width`: 200px (侧边栏宽度)

**字体**:
- 主字体: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- 代码字体: "SF Mono", "Fira Code", Consolas, monospace

### 2.3 组件规范

**按钮**:
- `.btn`: 基础按钮样式
- `.btn-primary`: 主按钮 (蓝色背景)
- `.btn-secondary`: 次级按钮 (灰色背景)
- `.btn-icon`: 图标按钮 (无背景)

**输入区域**:
- Monaco Editor 用于代码编辑
- Textarea 用于简单文本输入

---

## 3. 功能需求

### 3.1 工具列表

#### 保留的工具 (5个):

| 工具名称 | 路径 | 功能描述 |
|---------|------|---------|
| JSON 格式化 | `/json` | JSON 格式化、压缩、验证、YAML转换、树形预览 |
| 文本差异 | `/diff` | 文本对比、差异统计、文件导入导出 |
| SQL 格式化 | `/sql` | SQL 格式化、多方言支持、关键字大小写设置 |
| Markdown | `/markdown` | Markdown 编辑器、实时预览、大纲导航 |
| 文件转换 | `/converter` | JSON↔YAML、JSON↔CSV、Markdown→HTML |

#### 移除的工具 (6个):
- Base64 编码
- URL 编码
- 时间戳
- Hash 计算
- 正则测试
- 颜色转换

### 3.2 详细功能规范

#### 3.2.1 JSON 格式化工具

**核心功能**:
- 格式化: 将 JSON 字符串美化为带缩进的格式
- 压缩: 将 JSON 压缩为单行
- 验证: 检查 JSON 格式是否有效，显示验证状态
- YAML 转换: 将 JSON 转换为 YAML 格式
- 树形预览: 以可折叠树形结构展示 JSON 数据

**交互功能**:
- 缩进选择: 2 空格 / 4 空格
- 一键复制: 复制结果到剪贴板
- 文件下载: 导出为 .json 文件
- 剪贴板粘贴: 从剪贴板读取输入

**技术实现**:
- 使用原生 `JSON.parse()` / `JSON.stringify()` 进行解析和格式化
- 使用 `js-yaml` 库进行 YAML 转换

#### 3.2.2 文本差异工具

**核心功能**:
- 双栏对比: 左右两栏分别输入原始文本和对比文本
- 视图模式: 并排视图 / 行内视图
- 差异统计: 显示新增、删除、修改的行数
- 忽略空白: 可选择是否忽略空白符差异

**交互功能**:
- 文件导入: 支持从文件读取文本内容
- 复制功能: 复制两侧文本
- 导出结果: 导出差异结果为文本文件

**技术实现**:
- 使用 `diff` 库进行文本差异计算

#### 3.2.3 SQL 格式化工具

**核心功能**:
- SQL 格式化: 将 SQL 语句格式化为易读格式
- 多方言支持: MySQL, PostgreSQL, SQLite, MariaDB, PL/SQL
- 关键字大小写: UPPER / lower / preserve 三种模式
- 缩进宽度: 2 空格 / 4 空格
- SQL 压缩: 将 SQL 压缩为单行

**交互功能**:
- 文件导入: 支持 .sql / .txt 文件
- 一键复制: 复制格式化结果
- 文件下载: 导出为 .sql 文件

**技术实现**:
- 使用 `sql-formatter` 库进行 SQL 格式化

#### 3.2.4 Markdown 编辑器

**核心功能**:
- 实时预览: 左侧编辑，右侧实时预览渲染结果
- 语法工具栏: 粗体、斜体、标题、列表、引用、代码块、链接、图片、表格
- 大纲导航: 自动提取标题生成可点击的大纲
- GFM 支持: 支持 GitHub Flavored Markdown

**交互功能**:
- 文件导入: 支持 .md / .txt / .markdown 文件
- 文件导出: 导出为 .md 文件
- 一键复制: 复制 Markdown 源码

**技术实现**:
- 使用 `marked` 库进行 Markdown 渲染
- Monaco Editor 作为编辑器组件

#### 3.2.5 文件转换工具

**支持的转换类型**:
1. JSON → YAML
2. YAML → JSON
3. JSON → CSV (数组格式)
4. CSV → JSON
5. Markdown → HTML

**交互功能**:
- 卡片式选择: 点击选择转换类型
- 实时转换: 输入后点击转换按钮
- 错误提示: 显示转换错误信息
- 复制/导出结果

**技术实现**:
- 使用 `js-yaml` 进行 JSON/YAML 转换
- 自定义 CSV 解析逻辑
- 使用 `marked` 进行 Markdown→HTML 转换

---

## 4. 验收标准

### 4.1 功能验收

- [ ] JSON 格式化工具可正确格式化、压缩、验证 JSON
- [ ] JSON 可转换为 YAML 格式
- [ ] JSON 树形预览可正确显示层级结构
- [ ] 文本差异工具可正确计算差异并统计
- [ ] SQL 格式化支持 5 种方言
- [ ] SQL 格式化可设置关键字大小写和缩进
- [ ] Markdown 编辑器实时预览正常工作
- [ ] Markdown 大纲导航可正确提取标题
- [ ] 文件转换工具 5 种转换都正常工作

### 4.2 UI/UX 验收

- [ ] 侧边栏正确显示 5 个工具入口
- [ ] 移除了不需要的 6 个工具
- [ ] 主题配色符合设计规范
- [ ] 响应式布局正常

### 4.3 构建验收

- [ ] TypeScript 编译无错误
- [ ] Vite 构建成功
- [ ] 无控制台报错

---

## 5. 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **路由**: React Router DOM 7
- **编辑器**: @monaco-editor/react
- **图标**: lucide-react
- **工具库**:
  - `sql-formatter` - SQL 格式化
  - `js-yaml` - YAML 转换
  - `marked` - Markdown 渲染
  - `diff` - 文本差异计算
