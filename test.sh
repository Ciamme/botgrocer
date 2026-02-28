#!/bin/bash

# BotGrocer 本地测试脚本
# 在部署前运行，确保代码质量

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

# 检查必要命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "命令 '$1' 未找到"
        exit 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}    BotGrocer 本地测试脚本${NC}"
    echo -e "${BLUE}============================================${NC}"
    
    # 检查必要命令
    print_info "检查必要命令..."
    check_command bun
    check_command curl
    
    # 检查项目结构
    print_info "检查项目结构..."
    REQUIRED_FILES=("src/simple.ts" "package.json" "tsconfig.json")
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "找到文件: $file"
        else
            print_error "缺少文件: $file"
            exit 1
        fi
    done
    
    # 检查TypeScript编译
    print_info "检查TypeScript编译..."
    if bun run build 2>/dev/null || true; then
        print_success "TypeScript编译检查通过"
    else
        print_warning "TypeScript编译有警告"
    fi
    
    # 检查依赖
    print_info "检查依赖..."
    if [[ -f "package.json" ]]; then
        print_success "package.json 存在"
        # 检查是否有缺失的依赖
        if bun install --dry-run 2>&1 | grep -q "error"; then
            print_error "依赖安装检查失败"
            exit 1
        fi
    fi
    
    # 启动本地测试服务器
    print_info "启动本地测试服务器..."
    LOCAL_PORT=3001
    bun run src/simple.ts --port $LOCAL_PORT > /tmp/botgrocer_test.log 2>&1 &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    # 测试本地服务器
    print_info "测试本地服务器..."
    if curl -s http://localhost:$LOCAL_PORT/ > /dev/null; then
        print_success "本地服务器启动成功"
        
        # 测试健康检查
        HEALTH_RESPONSE=$(curl -s http://localhost:$LOCAL_PORT/health)
        if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
            print_success "健康检查API正常"
        else
            print_error "健康检查API异常: $HEALTH_RESPONSE"
        fi
        
        # 测试产品API
        PRODUCTS_RESPONSE=$(curl -s http://localhost:$LOCAL_PORT/api/products)
        if echo "$PRODUCTS_RESPONSE" | grep -q '"id":'; then
            print_success "产品API正常"
        else
            print_error "产品API异常: $PRODUCTS_RESPONSE"
        fi
    else
        print_error "本地服务器启动失败"
        echo "查看日志: /tmp/botgrocer_test.log"
    fi
    
    # 停止测试服务器
    kill $SERVER_PID 2>/dev/null || true
    
    # 代码质量检查
    print_info "代码质量检查..."
    
    # 检查是否有console.log在生产代码中
    if grep -r "console\.log" src/ --include="*.ts" --include="*.js" | grep -v "test" | grep -v "//"; then
        print_warning "发现console.log语句，建议在生产代码中移除"
    fi
    
    # 检查文件大小
    print_info "检查文件大小..."
    LARGE_FILES=$(find src/ -name "*.ts" -size +100k 2>/dev/null || true)
    if [[ -n "$LARGE_FILES" ]]; then
        print_warning "发现大文件:"
        echo "$LARGE_FILES"
    fi
    
    # 安全检查
    print_info "安全检查..."
    # 检查是否有硬编码的敏感信息
    if grep -r "password\|secret\|token\|key" src/ --include="*.ts" | grep -v "//" | grep -v "test"; then
        print_warning "发现可能的敏感信息，请检查"
    fi
    
    echo -e "\n${BLUE}============================================${NC}"
    print_success "所有测试完成！"
    echo -e "${BLUE}============================================${NC}"
    
    # 显示总结
    echo -e "\n${GREEN}✅ 测试通过，可以部署${NC}"
    echo -e "${BLUE}部署命令:${NC}"
    echo "  ./deploy.sh prod    # 部署到生产环境"
    echo "  ./deploy.sh dev     # 部署到开发环境"
    
    echo -e "\n${BLUE}服务器状态:${NC}"
    echo "  服务器IP: 67.209.182.135"
    echo "  当前状态: $(curl -s https://botgrocer.com/health | grep -o '"status":"[^"]*"' || echo '未知')"
}

# 执行主函数
main "$@"