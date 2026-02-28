#!/bin/bash

# ============================================
# BotGrocer 自动部署脚本
# 使用方法: ./deploy.sh [环境]
#   环境: dev (开发环境) | prod (生产环境)
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="67.209.182.135"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_PORT="22"
REMOTE_USER="root"
REMOTE_DIR="/opt/botgrocer"

# 本地配置
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="botgrocer"

# 环境配置
ENV=${1:-"prod"}
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    echo -e "${RED}错误: 环境参数必须是 'dev' 或 'prod'${NC}"
    echo "使用方法: $0 [dev|prod]"
    exit 1
fi

# 函数：打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "命令 '$1' 未找到，请先安装"
        exit 1
    fi
}

# 函数：执行远程命令
remote_exec() {
    ssh -i "$SSH_KEY" -p "$SSH_PORT" "$REMOTE_USER@$SERVER_IP" "$1"
}

# 函数：上传文件/目录
upload() {
    local src="$1"
    local dst="$2"
    
    if [[ -d "$src" ]]; then
        print_info "上传目录: $src → $dst"
        scp -i "$SSH_KEY" -P "$SSH_PORT" -r "$src" "$REMOTE_USER@$SERVER_IP:$dst"
    else
        print_info "上传文件: $src → $dst"
        scp -i "$SSH_KEY" -P "$SSH_PORT" "$src" "$REMOTE_USER@$SERVER_IP:$dst"
    fi
}

# 函数：备份远程文件
backup_remote() {
    local file="$1"
    local backup_dir="/opt/backups/botgrocer/$(date +%Y%m%d_%H%M%S)"
    
    print_info "备份远程文件: $file"
    remote_exec "mkdir -p $backup_dir && cp -r $file $backup_dir/ 2>/dev/null || true"
}

# 函数：检查本地更改
check_local_changes() {
    print_info "检查本地Git状态..."
    if [[ -d "$LOCAL_DIR/.git" ]]; then
        if [[ -n $(git -C "$LOCAL_DIR" status --porcelain) ]]; then
            print_warning "本地有未提交的更改"
            read -p "是否继续部署？(y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "部署已取消"
                exit 0
            fi
        fi
    fi
}

# 函数：部署开发环境
deploy_dev() {
    print_info "开始部署开发环境..."
    
    # 1. 备份当前生产环境
    backup_remote "$REMOTE_DIR"
    
    # 2. 上传源代码
    upload "$LOCAL_DIR/src/" "$REMOTE_DIR/"
    
    # 3. 上传配置文件
    upload "$LOCAL_DIR/package.json" "$REMOTE_DIR/"
    upload "$LOCAL_DIR/tsconfig.json" "$REMOTE_DIR/"
    
    # 4. 安装依赖
    print_info "安装依赖..."
    remote_exec "cd $REMOTE_DIR && bun install"
    
    # 5. 重启应用
    print_info "重启开发环境应用..."
    remote_exec "cd $REMOTE_DIR && pkill -f bun 2>/dev/null || true"
    remote_exec "cd $REMOTE_DIR && nohup bun run src/simple.ts > /var/log/botgrocer_dev.log 2>&1 &"
    
    print_success "开发环境部署完成"
}

# 函数：部署生产环境
deploy_prod() {
    print_info "开始部署生产环境..."
    
    # 1. 备份当前生产环境
    backup_remote "$REMOTE_DIR"
    
    # 2. 上传所有必要文件
    print_info "上传源代码..."
    upload "$LOCAL_DIR/src/" "$REMOTE_DIR/"
    
    print_info "上传配置文件..."
    upload "$LOCAL_DIR/package.json" "$REMOTE_DIR/"
    upload "$LOCAL_DIR/tsconfig.json" "$REMOTE_DIR/"
    upload "$LOCAL_DIR/restart.sh" "$REMOTE_DIR/"
    upload "$LOCAL_DIR/monitor.sh" "$REMOTE_DIR/"
    
    # 3. 安装生产依赖
    print_info "安装生产依赖..."
    remote_exec "cd $REMOTE_DIR && bun install --production"
    
    # 4. 运行测试
    print_info "运行本地测试..."
    if [[ -f "$LOCAL_DIR/test.sh" ]]; then
        bash "$LOCAL_DIR/test.sh"
    else
        print_warning "未找到测试脚本，跳过测试"
    fi
    
    # 5. 重启应用
    print_info "重启生产环境应用..."
    remote_exec "bash $REMOTE_DIR/restart.sh"
    
    # 6. 验证部署
    print_info "验证部署..."
    sleep 3
    if remote_exec "curl -s http://localhost:3000/health | grep -q 'ok'"; then
        print_success "应用健康检查通过"
    else
        print_error "应用健康检查失败"
        exit 1
    fi
    
    print_success "生产环境部署完成"
}

# 函数：显示部署状态
show_status() {
    print_info "检查部署状态..."
    
    echo -e "\n${BLUE}=== 部署状态 ===${NC}"
    
    # 检查应用进程
    print_info "应用进程状态:"
    remote_exec "ps aux | grep -E 'bun.*simple' | grep -v grep || echo '未找到应用进程'"
    
    # 检查端口监听
    print_info "端口监听状态:"
    remote_exec "netstat -tlnp | grep :3000 || echo '端口3000未监听'"
    
    # 检查应用日志
    print_info "应用日志最后5行:"
    remote_exec "tail -5 /var/log/botgrocer.log 2>/dev/null || echo '日志文件不存在'"
    
    # 检查Nginx状态
    print_info "Nginx状态:"
    remote_exec "systemctl status nginx --no-pager | head -10"
    
    # 检查HTTPS访问
    print_info "HTTPS访问测试:"
    curl -s -o /dev/null -w "HTTPS状态码: %{http_code}\n" https://botgrocer.com/health || echo "HTTPS访问失败"
    
    echo -e "\n${BLUE}=== 部署完成 ===${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}    BotGrocer 自动部署脚本${NC}"
    echo -e "${BLUE}    环境: $ENV${NC}"
    echo -e "${BLUE}    服务器: $SERVER_IP${NC}"
    echo -e "${BLUE}============================================${NC}"
    
    # 检查必要命令
    check_command ssh
    check_command scp
    check_command curl
    
    # 检查SSH密钥
    if [[ ! -f "$SSH_KEY" ]]; then
        print_error "SSH密钥不存在: $SSH_KEY"
        exit 1
    fi
    
    # 检查服务器连接
    print_info "测试服务器连接..."
    if ! remote_exec "echo '连接成功'" &> /dev/null; then
        print_error "无法连接到服务器: $SERVER_IP"
        exit 1
    fi
    
    # 检查本地更改
    check_local_changes
    
    # 根据环境部署
    if [[ "$ENV" == "dev" ]]; then
        deploy_dev
    else
        deploy_prod
    fi
    
    # 显示部署状态
    show_status
    
    # 显示访问信息
    echo -e "\n${GREEN}✅ 部署完成！${NC}"
    echo -e "${BLUE}访问地址:${NC}"
    echo "  HTTPS: https://botgrocer.com"
    echo "  HTTP: http://botgrocer.com (自动重定向到HTTPS)"
    echo "  健康检查: https://botgrocer.com/health"
    echo "  产品API: https://botgrocer.com/api/products"
    
    # 显示日志查看命令
    echo -e "\n${BLUE}日志查看:${NC}"
    echo "  ssh -i $SSH_KEY -p $SSH_PORT $REMOTE_USER@$SERVER_IP 'tail -f /var/log/botgrocer.log'"
}

# 执行主函数
main "$@"