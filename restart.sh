#!/bin/bash
echo "=== BotGrocer 重启脚本 ==="
echo ""

# 停止现有进程
echo "1. 停止现有Bun进程..."
pkill -f bun 2>/dev/null || true
sleep 2

# 启动应用
echo "2. 启动BotGrocer应用..."
export BUN_INSTALL="/root/.bun"
export PATH="/root/.bun/bin:$PATH"
cd /opt/botgrocer
nohup bun run src/simple.ts > /var/log/botgrocer.log 2>&1 &
sleep 3

# 检查状态
echo "3. 检查应用状态..."
if ps aux | grep -q "bun run src/simple.ts"; then
    echo "✅ 应用正在运行"
    echo "测试访问..."
    curl -s http://localhost:3000/health || echo "应用未响应"
else
    echo "❌ 应用启动失败"
    echo "查看日志..."
    tail -10 /var/log/botgrocer.log
fi

echo ""
echo "4. 检查Nginx状态..."
systemctl status nginx --no-pager | head -10