# MyToolBox 开发工具集 - 任务清单

## 项目阶段划分

### Phase 1: 需求分析与工具栏调整

- [x] 分析现有代码结构
- [x] 确定保留的工具列表 (5个)
- [x] 确定移除的工具列表 (6个)
- [x] 更新侧边栏导航配置
- [x] 更新路由配置

### Phase 2: JSON 格式化工具实现

- [x] 实现 JSON 格式化功能
- [x] 实现 JSON 压缩功能
- [x] 实现 JSON 验证功能
- [x] 实现 JSON 转 YAML 功能
- [x] 实现 JSON 树形预览功能
- [x] 添加缩进选择 (2/4 空格)
- [x] 添加复制、下载、粘贴功能

### Phase 3: 文本差异工具实现

- [x] 实现双栏文本输入
- [x] 实现差异计算逻辑
- [x] 实现差异统计显示
- [x] 实现并排/行内视图切换
- [x] 添加忽略空白符选项
- [x] 添加文件导入功能
- [x] 添加复制、导出功能

### Phase 4: SQL 格式化工具实现

- [x] 实现 SQL 格式化功能
- [x] 集成 sql-formatter 库
- [x] 添加多方言支持 (MySQL, PostgreSQL, SQLite, MariaDB, PL/SQL)
- [x] 添加关键字大小写设置 (UPPER/lower/preserve)
- [x] 添加缩进宽度设置 (2/4 空格)
- [x] 实现 SQL 压缩功能
- [x] 添加文件导入、复制、下载功能

### Phase 5: Markdown 编辑器实现

- [x] 实现 Markdown 编辑器界面
- [x] 集成 marked 库进行渲染
- [x] 实现实时预览功能
- [x] 添加语法工具栏 (粗体、斜体、标题、列表、引用、代码块、链接、图片、表格)
- [x] 实现大纲导航功能
- [x] 添加 GFM 支持
- [x] 添加文件导入、导出功能

### Phase 6: 文件转换工具实现

- [x] 实现 JSON → YAML 转换
- [x] 实现 YAML → JSON 转换
- [x] 实现 JSON → CSV 转换
- [x] 实现 CSV → JSON 转换
- [x] 实现 Markdown → HTML 转换
- [x] 添加卡片式转换类型选择
- [x] 添加错误处理和提示
- [x] 添加复制、导出功能

### Phase 7: 文档与构建

- [x] 创建 SPEC.md 需求规范文档
- [x] 创建 tasks.md 任务清单
- [x] 创建 checklist.md 验收清单
- [x] 执行 TypeScript 编译检查
- [x] 执行 Vite 生产构建

---

## 任务状态说明

| 状态 | 描述 |
|------|------|
| pending | 待开始 |
| in_progress | 进行中 |
| completed | 已完成 |

---

## 技术决策记录

1. **选择 sql-formatter 库**: 支持多种 SQL 方言，配置灵活
2. **选择 js-yaml 库**: 轻量级，API 简洁
3. **选择 marked 库**: 支持 GFM，渲染性能好
4. **选择 diff 库**: 功能全面，支持多种对比模式
5. **Monaco Editor**: 提供专业的代码编辑体验，支持语法高亮
