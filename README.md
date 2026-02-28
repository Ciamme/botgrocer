# BotGrocer - AI Agent Marketplace

首个为AI智能体设计的购物网站。

## 🚀 快速开始

### 环境要求
- **Node.js**: 18+ (推荐使用Bun)
- **Bun**: 1.0+ (推荐运行时)
- **Git**: 版本控制

### 本地开发
```bash
# 1. 克隆项目
git clone <repository-url>
cd botgrocer

# 2. 安装依赖
bun install

# 3. 启动开发服务器
bun run dev

# 4. 访问本地服务
#    http://localhost:3000
#    http://localhost:3000/health
```

### 一键部署
```bash
# 部署到生产环境
./deploy.sh prod

# 部署到开发环境  
./deploy.sh dev

# 查看部署状态
./deploy.sh status
```

## 📁 项目结构

```
botgrocer/
├── src/                    # 源代码目录
│   ├── simple.ts          # 主应用文件
│   └── enhanced.ts        # 增强版本
├── public/                # 静态文件
│   └── status.html        # 状态页面
├── scripts/               # 脚本目录
│   ├── deploy.sh          # 自动部署脚本
│   ├── test.sh           # 本地测试脚本
│   ├── restart.sh        # 服务器重启脚本
│   └── monitor.sh        # 服务器监控脚本
├── docs/                  # 文档
│   ├── SSL_MANAGEMENT.md # SSL证书管理
│   └── API_DOCS.md       # API文档
├── package.json          # 项目配置
├── tsconfig.json        # TypeScript配置
└── README.md            # 项目说明
```

## 🔧 部署脚本说明

### deploy.sh - 自动部署脚本
```bash
# 基本用法
./deploy.sh [环境]

# 示例
./deploy.sh prod      # 部署到生产环境
./deploy.sh dev       # 部署到开发环境
```

**功能特性：**
- ✅ 自动备份当前版本
- ✅ 上传源代码和配置文件
- ✅ 安装依赖
- ✅ 重启服务
- ✅ 验证部署结果
- ✅ 显示部署状态

### test.sh - 本地测试脚本
```bash
# 运行本地测试
./test.sh
```

**测试内容：**
- ✅ 项目结构检查
- ✅ TypeScript编译检查
- ✅ 本地服务器启动测试
- ✅ API功能测试
- ✅ 代码质量检查
- ✅ 安全检查

## 🌐 服务器配置

### 生产服务器
- **IP地址**: 67.209.182.135
- **SSH端口**: 22
- **部署目录**: `/opt/botgrocer`
- **SSH密钥**: `~/.ssh/id_ed25519`

### 服务管理
```bash
# 重启应用
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "cd /opt/botgrocer && ./restart.sh"

# 监控状态
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "cd /opt/botgrocer && ./monitor.sh"

# 查看日志
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "tail -f /var/log/botgrocer.log"
```

## 🔒 HTTPS配置

### 证书信息
- **域名**: botgrocer.com, www.botgrocer.com
- **颁发机构**: Let's Encrypt
- **有效期**: 90天 (自动续订)
- **加密协议**: TLS 1.3 + HTTP/2

### 访问方式
- **主地址**: https://botgrocer.com
- **HTTP重定向**: http://botgrocer.com → https://botgrocer.com
- **健康检查**: https://botgrocer.com/health
- **产品API**: https://botgrocer.com/api/products

## 📡 API文档

### 健康检查
```http
GET /health
```
**响应:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T09:00:56.160Z",
  "server": "67.209.182.135"
}
```

### 产品列表
```http
GET /api/products
```
**响应:**
```json
[
  {
    "id": 1,
    "name": "OpenAI API",
    "price": 99.99,
    "category": "api"
  },
  {
    "id": 2,
    "name": "GPU Compute", 
    "price": 4.99,
    "category": "compute"
  }
]
```

### 服务器信息
```http
GET /api/info
```
**响应:**
```json
{
  "name": "BotGrocer",
  "version": "1.0.0",
  "description": "AI Agent Marketplace",
  "endpoints": ["/", "/health", "/api/products", "/api/info"]
}
```

## 🛠️ 开发工作流

### 1. 本地开发
```bash
# 启动开发服务器
bun run dev

# 运行测试
./test.sh

# 提交代码
git add .
git commit -m "功能描述"
git push
```

### 2. 部署流程
```bash
# 运行完整测试
./test.sh

# 部署到生产环境
./deploy.sh prod

# 验证部署
curl https://botgrocer.com/health
```

### 3. 监控和维护
```bash
# 查看服务器状态
./deploy.sh status

# 查看应用日志
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "tail -f /var/log/botgrocer.log"

# 重启服务
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "cd /opt/botgrocer && ./restart.sh"
```

## 🔍 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查SSH连接
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "echo '连接测试'"

# 检查服务器状态
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "systemctl status nginx"
```

#### 2. HTTPS证书问题
```bash
# 检查证书状态
echo | openssl s_client -connect botgrocer.com:443 -servername botgrocer.com 2>/dev/null | openssl x509 -noout -dates

# 手动续订证书
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "certbot renew --force-renewal"
```

#### 3. 应用无法启动
```bash
# 查看应用日志
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "tail -50 /var/log/botgrocer.log"

# 重启应用
ssh -i ~/.ssh/id_ed25519 root@67.209.182.135 "cd /opt/botgrocer && ./restart.sh"
```

## 📈 监控指标

### 应用健康
- **响应时间**: < 1秒
- **可用性**: 99.9%
- **错误率**: < 0.1%

### 服务器资源
- **CPU使用率**: < 80%
- **内存使用率**: < 80%
- **磁盘空间**: > 20%

### 证书状态
- **有效期**: > 30天
- **续订状态**: 自动续订正常

## 📝 更新日志

### 2026-02-28
- ✅ 初始版本部署完成
- ✅ HTTPS SSL证书配置
- ✅ 自动部署脚本创建
- ✅ 完整监控系统设置
- ✅ 文档和测试脚本完善

## 📞 支持

### 紧急问题
1. 检查服务器状态: `./deploy.sh status`
2. 查看应用日志: `ssh ... 'tail -f /var/log/botgrocer.log'`
3. 重启服务: `ssh ... 'cd /opt/botgrocer && ./restart.sh'`

### 常规维护
- 每天自动检查证书续订
- 每周检查服务器资源
- 每月备份重要数据

---

**最后更新**: 2026-02-28  
**维护者**: nanobot 🐈  
**状态**: ✅ 生产环境运行正常