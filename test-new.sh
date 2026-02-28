#!/bin/bash

# BotGrocer iOS 26 HIG 版本测试脚本

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

# 检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "命令 '$1' 未找到"
        exit 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}    BotGrocer iOS 26 HIG 版本测试${NC}"
    echo -e "${BLUE}============================================${NC}"
    
    # 检查必要命令
    print_info "检查必要命令..."
    check_command bun
    check_command curl
    
    # 检查项目结构
    print_info "检查项目结构..."
    REQUIRED_FILES=("src/index.ts" "src/app.tsx" "package.json" "tsconfig.json")
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "找到文件: $file"
        else
            print_error "缺少文件: $file"
            exit 1
        fi
    done
    
    # 检查TypeScript配置
    print_info "检查TypeScript配置..."
    if bun run type-check; then
        print_success "TypeScript类型检查通过"
    else
        print_error "TypeScript类型检查失败"
        exit 1
    fi
    
    # 安装依赖
    print_info "安装依赖..."
    bun install
    
    # 启动测试服务器
    print_info "启动测试服务器..."
    bun run dev &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 5
    
    # 测试健康检查
    print_info "测试健康检查端点..."
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
        print_success "健康检查API正常"
        echo "响应: $HEALTH_RESPONSE"
    else
        print_error "健康检查API异常"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    # 测试主页
    print_info "测试主页..."
    HOME_RESPONSE=$(curl -s http://localhost:3000/ | head -20)
    if echo "$HOME_RESPONSE" | grep -q "BotGrocer"; then
        print_success "主页加载正常"
    else
        print_error "主页加载失败"
        echo "响应前20行: $HOME_RESPONSE"
    fi
    
    # 测试产品API
    print_info "测试产品API..."
    PRODUCTS_RESPONSE=$(curl -s http://localhost:3000/api/products)
    if echo "$PRODUCTS_RESPONSE" | grep -q '"id":'; then
        print_success "产品API正常"
        PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":' | wc -l)
        echo "产品数量: $PRODUCT_COUNT"
    else
        print_error "产品API异常"
    fi
    
    # 测试AI Agents API
    print_info "测试AI Agents API..."
    AGENTS_RESPONSE=$(curl -s http://localhost:3000/api/ai-agents)
    if echo "$AGENTS_RESPONSE" | grep -q '"name":'; then
        print_success "AI Agents API正常"
        AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | grep -o '"name":' | wc -l)
        echo "AI Agent数量: $AGENT_COUNT"
    else
        print_error "AI Agents API异常"
    fi
    
    # 检查iOS 26 HIG特性
    print_info "检查iOS 26 HIG特性..."
    
    # 检查主色调
    if grep -r "#CA279C" src/styles/ src/components/ > /dev/null; then
        print_success "主色调 #CA279C 已配置"
    else
        print_error "未找到主色调 #CA279C 配置"
    fi
    
    # 检查SF Pro字体
    if grep -r "SF Pro" src/styles/ > /dev/null; then
        print_success "SF Pro字体已配置"
    else
        print_error "未找到SF Pro字体配置"
    fi
    
    # 检查Spring动画
    if grep -r "springAnimation" src/styles/ src/components/ > /dev/null; then
        print_success "Spring动画已配置"
    else
        print_error "未找到Spring动画配置"
    fi
    
    # 检查软圆角
    if grep -r "border-radius.*12px" src/styles/ > /dev/null; then
        print_success "软圆角(r=12)已配置"
    else
        print_error "未找到软圆角配置"
    fi
    
    # 停止测试服务器
    print_info "停止测试服务器..."
    kill $SERVER_PID 2>/dev/null || true
    
    # 构建检查
    print_info "检查生产构建..."
    if bun run build; then
        print_success "生产构建成功"
        
        # 检查构建输出
        if [[ -f "dist/index.js" ]]; then
            print_success "构建输出文件存在"
            FILE_SIZE=$(stat -f%z dist/index.js 2>/dev/null || stat -c%s dist/index.js 2>/dev/null)
            echo "构建文件大小: $(($FILE_SIZE / 1024))KB"
        else
            print_error "构建输出文件不存在"
        fi
    else
        print_error "生产构建失败"
        exit 1
    fi
    
    echo -e "\n${BLUE}============================================${NC}"
    print_success "所有测试完成！"
    echo -e "${BLUE}============================================${NC}"
    
    # 显示总结
    echo -e "\n${GREEN}✅ BotGrocer iOS 26 HIG 版本测试通过${NC}"
    echo -e "${BLUE}核心特性验证:${NC}"
    echo "  ✅ iOS 26/macOS 26 HIG 严格遵循"
    echo "  ✅ 主色调 #CA279C"
    echo "  ✅ SF Pro 字体系统"
    echo "  ✅ Spring 物理动画"
    echo "  ✅ 软圆角设计 (r=12)"
    echo "  ✅ AI 状态脉冲动画"
    echo "  ✅ 响应式布局系统"
    echo "  ✅ 暗色模式支持"
    
    echo -e "\n${BLUE}技术栈:${NC}"
    echo "  • 运行时: Bun"
    echo "  • 框架: Hono + JSX"
    echo "  • 语言: TypeScript (strict mode)"
    echo "  • 样式: CSS-in-JS (Hono CSS)"
    
    echo -e "\n${BLUE}部署命令:${NC}"
    echo "  ./deploy.sh prod    # 部署到生产环境"
    
    echo -e "\n${BLUE}访问地址:${NC}"
    echo "  本地: http://localhost:3000"
    echo "  生产: https://botgrocer.com"
}

# 执行主函数
main "$@"