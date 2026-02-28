#!/bin/bash

# BotGrocer启动脚本

# 设置Bun环境
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# 进入项目目录
cd /opt/botgrocer

# 检查Bun
if ! command -v bun &> /dev/null; then
    echo "错误: Bun未安装"
    exit 1
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo "创建.env文件..."
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:@localhost:5432/botgrocer
JWT_SECRET=test-jwt-secret-key-1234567890
SESSION_SECRET=test-session-secret-1234567890
API_KEY_SALT=test-api-salt-1234567890
CORS_ORIGIN=*
AGENT_API_ENABLED=true
MCP_ENABLED=false
UI_PRIMARY_COLOR=#CA279C
DEFAULT_LOCALE=en
LOG_LEVEL=info
EOF
fi

# 停止现有进程
pkill -f "bun run dev" 2>/dev/null || true
pkill -f "bun run start" 2>/dev/null || true

# 启动应用
echo "启动BotGrocer..."
bun run dev > /var/log/botgrocer.log 2>&1 &

# 等待启动
sleep 3

# 检查是否运行
if ps aux | grep -q "bun run dev"; then
    echo "✅ BotGrocer已启动"
    echo "日志: /var/log/botgrocer.log"
    echo "API: http://localhost:3000"
    echo "健康检查: http://localhost:3000/health"
else
    echo "❌ BotGrocer启动失败"
    echo "查看日志: tail -50 /var/log/botgrocer.log"
    exit 1
fi