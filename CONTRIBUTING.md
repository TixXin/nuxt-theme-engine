# Contributing

感谢你对 `@tixxin/nuxt-theme-engine` 的关注！欢迎提交 Issue 和 Pull Request。

## 开发环境

```bash
# 克隆仓库
git clone https://github.com/tixxin/nuxt-theme-engine.git
cd nuxt-theme-engine

# 安装依赖
pnpm install

# 生成类型
pnpm dev:prepare

# 启动 playground
pnpm dev
```

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat(scope):` 新增功能
- `fix(scope):` 修复缺陷
- `docs(scope):` 文档变更
- `refactor(scope):` 重构（非功能/修复）
- `chore(scope):` 构建/工具链变更

常用 scope：`core`、`contracts`、`playground`、`docs`、`themes`

## 新增主题

1. 在 `playground/themes/` 下创建目录
2. 编写 `theme.json`（`name` 字段必须匹配 `^[a-z0-9-]+$`）
3. 在 `app/components/` 中实现契约组件
4. 在 `app/assets/` 中定义 CSS 变量和样式
5. 启动 playground 验证渲染和主题切换

## 扩展契约

1. 在 `packages/theme-contracts/src/index.ts` 中新增接口
2. 更新 `ThemeComponentContracts` 和 `themeContractNames`
3. 构建契约包：`pnpm --filter @tixxin/theme-contracts build`
4. 在至少一个主题中实现新契约组件

## 代码质量

提交前请确保：

```bash
pnpm typecheck   # 类型检查通过
pnpm build       # 构建成功
```
