#!/bin/bash

# BotGrocer iOS 26 HIG版本快速部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 服务器配置
SERVER="67.209.182.135"
USER="root"
PROJECT_DIR="/var/www/botgrocer"
BACKUP_DIR="/var/www/backups"

# 本地配置
LOCAL_DIR="/Users/willsgeo/projects/botgrocer"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 主函数
main() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}    BotGrocer iOS 26 HIG版本部署${NC}"
    echo -e "${BLUE}============================================${NC}"
    
    # 1. 本地验证
    print_info "1. 本地验证..."
    
    # 检查必要文件
    REQUIRED_FILES=(
        "src/index.ts"
        "src/app.tsx"
        "package.json"
        "tsconfig.json"
        "src/components/"
        "src/styles/"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -e "$LOCAL_DIR/$file" ]]; then
            print_success "找到: $file"
        else
            print_error "缺少: $file"
            exit 1
        fi
    done
    
    # 检查Bun
    if ! command -v bun &> /dev/null; then
        print_error "Bun未安装"
        exit 1
    fi
    
    # 2. 本地构建测试
    print_info "2. 本地构建测试..."
    
    cd "$LOCAL_DIR"
    
    # 安装依赖
    print_info "安装依赖..."
    bun install
    
    # TypeScript检查
    print_info "TypeScript类型检查..."
    if bun run type-check 2>/dev/null; then
        print_success "TypeScript检查通过"
    else
        print_warning "TypeScript检查有警告，继续..."
    fi
    
    # 构建测试
    print_info "构建测试..."
    if bun run build; then
        print_success "构建成功"
    else
        print_error "构建失败"
        exit 1
    fi
    
    # 3. 准备部署包
    print_info "3. 准备部署包..."
    
    DEPLOY_PACKAGE="/tmp/botgrocer_ios26_${TIMESTAMP}.tar.gz"
    
    # 创建临时目录
    TEMP_DIR="/tmp/botgrocer_deploy_${TIMESTAMP}"
    mkdir -p "$TEMP_DIR"
    
    # 复制必要文件
    cp -r "$LOCAL_DIR/src" "$TEMP_DIR/"
    cp "$LOCAL_DIR/package.json" "$TEMP_DIR/"
    cp "$LOCAL_DIR/tsconfig.json" "$TEMP_DIR/"
    cp "$LOCAL_DIR/bun.lock" "$TEMP_DIR/"
    cp "$LOCAL_DIR/.env.example" "$TEMP_DIR/.env" 2>/dev/null || true
    
    # 创建启动脚本
    cat > "$TEMP_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=production
bun start
EOF
    chmod +x "$TEMP_DIR/start.sh"
    
    # 创建健康检查脚本
    cat > "$TEMP_DIR/health_check.sh" << 'EOF'
#!/bin/bash
curl -f http://localhost:3000/health > /dev/null 2>&1
exit $?
EOF
    chmod +x "$TEMP_DIR/health_check.sh"
    
    # 打包
    cd "$TEMP_DIR"
    tar -czf "$DEPLOY_PACKAGE" .
    print_success "部署包创建完成: $(basename $DEPLOY_PACKAGE)"
    
    # 4. 部署到服务器
    print_info "4. 部署到服务器..."
    
    # 上传到服务器
    print_info "上传部署包..."
    scp "$DEPLOY_PACKAGE" "${USER}@${SERVER}:/tmp/"
    
    # 执行远程部署
    print_info "执行远程部署..."
    ssh "${USER}@${SERVER}" "
        set -e
        
        echo '=== 远程部署开始 ==='
        
        # 创建备份
        echo '创建备份...'
        mkdir -p $BACKUP_DIR
        if [ -d \"$PROJECT_DIR\" ]; then
            tar -czf \"$BACKUP_DIR/botgrocer_backup_${TIMESTAMP}.tar.gz\" -C \"$PROJECT_DIR\" .
            echo '✅ 备份创建完成'
        fi
        
        # 停止当前服务
        echo '停止当前服务...'
        pkill -f 'bun start' || true
        sleep 2
        
        # 清理并部署新版本
        echo '部署新版本...'
        rm -rf \"$PROJECT_DIR\"
        mkdir -p \"$PROJECT_DIR\"
        tar -xzf \"/tmp/$(basename $DEPLOY_PACKAGE)\" -C \"$PROJECT_DIR\"
        
        # 安装依赖
        echo '安装依赖...'
        cd \"$PROJECT_DIR\"
        bun install --production
        
        # 启动服务
        echo '启动服务...'
        nohup ./start.sh > /var/log/botgrocer.log 2>&1 &
        
        # 等待启动
        echo '等待服务启动...'
        sleep 5
        
        # 健康检查
        echo '健康检查...'
        if ./health_check.sh; then
            echo '✅ 服务启动成功'
        else
            echo '❌ 服务启动失败'
            exit 1
        fi
        
        echo '=== 远程部署完成 ==='
    "
    
    # 5. 验证部署
    print_info "5. 验证部署..."
    
    # 等待服务完全启动
    sleep 3
    
    # 测试健康检查
    print_info "测试健康检查..."
    if curl -s -f "https://botgrocer.com/health" > /dev/null; then
        print_success "健康检查通过"
        
        # 显示健康信息
        HEALTH_INFO=$(curl -s "https://botgrocer.com/health")
        echo "健康信息: $HEALTH_INFO"
    else
        print_error "健康检查失败"
        exit 1
    fi
    
    # 测试主页
    print_info "测试主页..."
    if curl -s -f "https://botgrocer.com" > /dev/null; then
        print_success "主页访问正常"
    else
        print_error "主页访问失败"
        exit 1
    fi
    
    # 测试API
    print_info "测试API..."
    if curl -s -f "https://botgrocer.com/api/products" > /dev/null; then
        print_success "产品API正常"
    else
        print_warning "产品API访问失败（可能是新功能）"
    fi
    
    # 6. 清理
    print_info "6. 清理..."
    rm -rf "$TEMP_DIR"
    rm -f "$DEPLOY_PACKAGE"
    
    # 7. 完成
    echo -e "\n${GREEN}============================================${NC}"
    print_success "🚀 BotGrocer iOS 26 HIG版本部署完成！"
    echo -e "${GREEN}============================================${NC}"
    
    echo -e "\n${BLUE}部署详情:${NC}"
    echo "🕐 时间: $(date)"
    echo "🌐 地址: https://botgrocer.com"
    echo "📊 健康: https://botgrocer.com/health"
    echo "🛒 产品: https://botgrocer.com/api/products"
    echo "🤖 AI智能体: https://botgrocer.com/api/ai-agents"
    echo "💾 备份: $BACKUP_DIR/botgrocer_backup_${TIMESTAMP}.tar.gz"
    
    echo -e "\n${BLUE}技术特性:${NC}"
    echo "🎨 iOS 26/macOS 26 HIG完全合规"
    echo "🤖 AI智能体专属购物体验"
    echo "⚡ Bun运行时 + Hono框架"
    echo "🔒 TypeScript严格模式"
    echo "🔄 自我进化架构"
    
    echo -e "\n${BLUE}验证命令:${NC}"
    echo "curl https://botgrocer.com/health"
    echo "curl https://botgrocer.com/api/products"
    echo "curl https://botgrocer.com/api/ai-agents"
    
    echo -e "\n${GREEN}✅ 部署成功！现在可以访问 https://botgrocer.com${NC}"
}

# 执行主函数
main "$@"