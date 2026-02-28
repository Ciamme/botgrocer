#!/bin/bash
echo "=== BotGrocer 监控脚本 ==="
echo "运行时间: $(date)"
echo ""

# 检查应用进程
echo "1. 检查应用进程..."
if ps aux | grep -q "bun run src/simple.ts"; then
    echo "✅ 应用进程运行中"
else
    echo "❌ 应用进程未运行，正在重启..."
    /opt/botgrocer/restart.sh
fi

# 检查端口监听
echo ""
echo "2. 检查端口监听..."
if netstat -tln | grep -q ":3000"; then
    echo "✅ 端口3000正在监听"
else
    echo "❌ 端口3000未监听"
fi

# 测试本地访问
echo ""
echo "3. 测试本地访问..."
LOCAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "FAIL")
if [ "$LOCAL_RESPONSE" = "200" ]; then
    echo "✅ 本地访问正常 (HTTP 200)"
else
    echo "❌ 本地访问失败: $LOCAL_RESPONSE"
fi

# 测试通过Nginx访问
echo ""
echo "4. 测试Nginx代理..."
NGINX_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: botgrocer.com" http://localhost/ || echo "FAIL")
if [ "$NGINX_RESPONSE" = "200" ]; then
    echo "✅ Nginx代理正常 (HTTP 200)"
else
    echo "❌ Nginx代理失败: $NGINX_RESPONSE"
    echo "检查Nginx错误日志..."
    tail -5 /var/log/nginx/error.log
fi

# 检查磁盘空间
echo ""
echo "5. 检查系统资源..."
df -h / | tail -1
free -h | head -2

echo ""
echo "=== 监控完成 ==="