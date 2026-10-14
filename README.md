# OIerAI

AI 竞赛代码诊断工具：粘贴题目和提交代码，定位错误、解释原因、给出最小修改建议。

## 新版 · C# 现代桌面界面
双击 **OIerAI/OIerAI.exe**，这是唯一正式版本。

C# / .NET 10 + WebView2；卡片式双栏布局，Markdown 支持语法高亮、表格与数学公式，所有渲染资源本地打包。点击「预览效果」无需 API 即可查看报告排版。

用法、运行环境与开发说明见 [modern/README.md](modern/README.md)。

## 目录
- `OIerAI/`：最终程序，复制时带上整个文件夹。
- `modern/`：源码和开发依赖。

接口配置保存在 `OIerAI/data/config.json`。程序、窗口和界面图标已统一，旧版本已删除。

程序只发送你手动提供的内容到你配置的 AI 接口，不抓取 OJ 站点。
