## 基础语法

- 数据结构：列表/元祖/字典/集合
- 函数：默认参数、可变参数（`args/kwargs`）、匿名函数（`lambda`）、装饰器
- 面向对象：类与继承、魔术方法（`init/__str__/__repr__`）、属性装饰器（`@property`）
- 异常处理：`try/except/finally`、自定义异常
- 模块与包：`import`机制、`init.py`、相对导入与绝对导入

## 工程化

- 包管理：`pip`、`requirements.txt`、`pyproject.toml`（现代 `Python` 标准）
- 虚拟环境：`venv`、`pipenv`、`conda`（解决不同项目依赖冲突）
- 代码规范：`PEP8`、`black`（自动格式化）、`flake8`（代码检查）
- 调试与测试：`pdb`调试器、`pytest`单元测试

## 高级特性

- 迭代器与生成器 `yield`
- 上下文管理器（`with`语句）
- 异步编程：`asyncio`

## 核心库

### 1. 科学计算

- `NumPy`：数组操作、线性代数、随机数生成
- `Pandas`：数据清洗、数据处理、`CSV/Excel`文件读写
- `Matplotlib/Seaborn`：数据可视化

### 2. 深度学习

- 经典网络：`Transformer`（大模型）
- 核心框架：`TyTorch`

### 3. `WebAI`

- 主流框架：`Transformers.js`、`ONNX Runtime Web`、`TensorFlow.js`
- 模型转换：将 `PyTorch/TensorFlow` 模型转换为 `ONNX` 格式
- 模型优化：量化（`INT8/FP16`）、剪枝、蒸馏
- 硬件加速：`WebGL/WebGPU`加速、图像识别、语音识别、姿态检测
- 向量数据库：`RAG`（检索增强生成）核心组件、`Chroma`（轻量级）、`Pinecone`（云服务）、`Milvus`
- `RAG`技术：文档加载、文本分割、向量嵌入、检索、生成
- 前后端联调：`React/Vue + FashAPI` + 向量数据库 + 大模型
- 部署：`Docker`容器化、`Vercel`（前端）、`Render/Fly.io`（后端）、`Hugging Face Spaces`（`AI`模型部署）

## 实战项目

1. `AI`聊天机器人：`OpenAI API` + `React` + `FastAPI`支持多轮对话的聊天机器人
2. `AI`图片生成器：`Stable Diffusion` 或 `DALL-E API` 文本生成图片应用
3. 文本摘要工具：`Transformers.js`在浏览器中运行文本摘要模型，不需要后端
4. `AI`代码解析器：调用大模型 `API`，解析代码片段的功能，找出代码中的 `bug`
5. 个人知识库 `RAG` 系统：上传文档（`PDF/Word/Markdown`），用 `RAG` 实现智能回答
6. `AI`代码助手 `VSCode` 插件：结合大模型 `API`，支持代码补全、代码解析、代码重构
7. 浏览器端图像识别应用：`Tranformers.js` 运行 `YOLO` 模型，实现实时物体检测
8. `AI`语音助手：结合语音识别 `Whisper` 和语音合成 `TTS API`，开发语音交互助手
9. 多模态 `AI` 应用：支持上传图片和文本，`GPT-4` 或 `QWen-VL`实现图文回答
10. `AI Agent`工作流：`LangGraph`开发能自动完成周报生成、邮件回复、会议纪要整理的 `AI` 代理
11. 自定义领域大模型：收集特定领域的数据，用 `LoRA` 微调开发大模型
12. `WebAI`实时应用：`WebGPU`加速，在浏览器中实现风格迁移、人体姿态估计

### 开发流程

1. **复刻项目**：优秀开源项目复刻，理解架构和代码，进行改进
2. **部署上线**：所有项目都要部署到线上，生成可访问链接，写详细的 `README` 文档
3. **技术博客**：把项目开发过程、遇到的问题、解决方案写成技术博客，发布到技术论坛
