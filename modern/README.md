# OIerAI · C# 现代桌面版

## 启动
双击 `../OIerAI/OIerAI.exe`。本机已装 .NET 10 Desktop Runtime 和 Edge WebView2 Runtime；其他电脑需要安装它们。无需 Python、Node 或 tkinter。

先点击「预览效果」查看报告：支持 GFM 表格、语法高亮、数学公式、引用和列表。题目输入可在 Markdown 编辑与预览间切换；代码输入会按照所选语言显示 VS Code 风格语法高亮。窄窗口自动改成上下布局。预览内容明确标记为内置示例，可复制与导出。点击「载入示例」填入一份有错的竞赛代码。

真正分析前打开「接口设置」，填写 OpenAI 兼容 API 地址、Key 和模型，测试后保存。支持流式输出、停止、思考过程、WA/TLE/RE/CE/MLE/AC 状态、补充报错信息、复制、Markdown 导出、代理、自定义提示词与超时。

配置保存在可执行程序旁边的 `data/config.json`，Key 明文存储。旧版本已删除。整个 OIerAI 文件夹一起复制，不能只拿走 exe。

## 实现
- C# / .NET 10 + WinForms 窗口宿主；所有可见界面为 WebView2 中的 HTML/CSS/JavaScript。
- C# HttpClient 负责 API 调用，密钥不发送到网页第三方。
- Marked + DOMPurify 渲染并净化 Markdown，Highlight.js 代码高亮，KaTeX 公式渲染。
- 所有脚本、样式与字体本地打包，不依赖 CDN。报告不加载外部图片或脚本。
- `Program.cs`：窗口、配置、模型客户端、取消与导出。
- `web/`：界面与渲染；`web/vendor/`：已打包第三方资源。

## 开发与验证
安装 .NET 10 SDK。运行 `dotnet build OIerAI.csproj -c Release`；发布 `dotnet publish OIerAI.csproj -c Release -o ../OIerAI`。

当前提供离线 NuGet 包源 `packages/`，网络不可用时：

```powershell
$env:DOTNET_CLI_HOME = "$PWD/.dotnet"
$env:NUGET_PACKAGES = "$PWD/.nuget"
dotnet restore OIerAI.csproj --source "$PWD/packages"
dotnet publish OIerAI.csproj --no-restore -c Release -o ../OIerAI
```

后端验证：`dotnet ../OIerAI/OIerAI.dll --self-test`，结果在 `../OIerAI/self-test.txt`。使用真实本地 TCP 模拟服务器验证 SSE、JSON 回退、HTTP 401 与报告元信息，不消耗真实 API。
前端验证：`npm.cmd ci --prefix web` 后 `node test-ui.cjs`。使用 jsdom 检查表格、代码高亮、消息桥、流式渲染与恶意 HTML 净化。

前端依赖已打包，正常开发界面无需安装 npm。修改高亮构建时：`web/node_modules/.bin/esbuild.cmd web/highlight-entry.js --bundle --minify --outfile=web/vendor/highlight.min.js`。

验证范围：构建与代码级测试已通过。桌面视觉截图检查因窗口工具审批服务故障未完成；未调用真实付费 AI 接口。
