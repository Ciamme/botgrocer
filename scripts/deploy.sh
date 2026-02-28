#!/bin/bash

# ============================================
# BotGrocer Deployment Script
# ============================================
#
# This script deploys BotGrocer to a remote server.
# It handles database setup, application deployment, and service configuration.
#
# Usage:
#   ./scripts/deploy.sh [environment]
#
# Environments:
#   production  - Deploy to production server
#   staging     - Deploy to staging server
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="botgrocer"
APP_USER="botgrocer"
APP_DIR="/opt/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
SERVICE_NAME="$APP_NAME-$ENVIRONMENT"

# Server configuration based on environment
case $ENVIRONMENT in
  production)
    SERVER_HOST="67.209.182.135"
    SERVER_USER="root"
    SSH_KEY="$HOME/.ssh/id_ed25519"
    DOMAIN="botgrocer.com"
    ;;
  staging)
    SERVER_HOST="staging.botgrocer.com"
    SERVER_USER="deploy"
    SSH_KEY="$HOME/.ssh/id_ed25519"
    DOMAIN="staging.botgrocer.com"
    ;;
  *)
    echo -e "${RED}Error: Unknown environment '$ENVIRONMENT'${NC}"
    echo "Usage: $0 [production|staging]"
    exit 1
    ;;
esac

SSH_OPTS="-i $SSH_KEY -p 22 -o StrictHostKeyChecking=no -o ConnectTimeout=30"

# ============================================
# Helper Functions
# ============================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

run_remote() {
  ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "$1"
}

run_remote_sudo() {
  ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "sudo $1"
}

copy_to_remote() {
  scp $SSH_OPTS -r "$1" $SERVER_USER@$SERVER_HOST:"$2"
}

# ============================================
# Deployment Steps
# ============================================

check_prerequisites() {
  log_info "Checking prerequisites..."
  
  # Check SSH key exists
  if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH key not found: $SSH_KEY"
    exit 1
  fi
  
  # Check local Git repository
  if [ ! -d ".git" ]; then
    log_error "Not in a Git repository"
    exit 1
  fi
  
  # Check Bun is installed locally
  if ! command -v bun &> /dev/null; then
    log_error "Bun is not installed locally"
    exit 1
  fi
  
  log_success "Prerequisites check passed"
}

setup_server() {
  log_info "Setting up server..."
  
  # Create application user if it doesn't exist
  if ! run_remote "id -u $APP_USER" &> /dev/null; then
    log_info "Creating application user: $APP_USER"
    run_remote_sudo "useradd -m -s /bin/bash $APP_USER"
    run_remote_sudo "usermod -aG sudo $APP_USER"
  fi
  
  # Create directories
  run_remote_sudo "mkdir -p $APP_DIR"
  run_remote_sudo "mkdir -p $LOG_DIR"
  run_remote_sudo "chown -R $APP_USER:$APP_USER $APP_DIR $LOG_DIR"
  run_remote_sudo "chmod 755 $APP_DIR $LOG_DIR"
  
  # Install system dependencies
  log_info "Installing system dependencies..."
  run_remote_sudo "apt-get update"
  run_remote_sudo "apt-get install -y curl git postgresql postgresql-contrib nginx certbot python3-certbot-nginx"
  
  # Install Bun
  if ! run_remote "command -v bun" &> /dev/null; then
    log_info "Installing Bun..."
    run_remote "curl -fsSL https://bun.sh/install | bash"
    run_remote "echo 'export BUN_INSTALL=\"\$HOME/.bun\"' >> ~/.bashrc"
    run_remote "echo 'export PATH=\"\$BUN_INSTALL/bin:\$PATH\"' >> ~/.bashrc"
    run_remote "source ~/.bashrc"
  fi
  
  log_success "Server setup completed"
}

setup_database() {
  log_info "Setting up database..."
  
  # Create PostgreSQL database and user
  run_remote_sudo "sudo -u postgres psql -c \"CREATE DATABASE $APP_NAME;\" 2>/dev/null || true"
  run_remote_sudo "sudo -u postgres psql -c \"CREATE USER $APP_USER WITH PASSWORD '$APP_NAME_password';\" 2>/dev/null || true"
  run_remote_sudo "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $APP_NAME TO $APP_USER;\""
  run_remote_sudo "sudo -u postgres psql -c \"ALTER DATABASE $APP_NAME OWNER TO $APP_USER;\""
  
  # Enable PostgreSQL extensions
  run_remote_sudo "sudo -u postgres psql -d $APP_NAME -c 'CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";'"
  run_remote_sudo "sudo -u postgres psql -d $APP_NAME -c 'CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";'"
  
  log_success "Database setup completed"
}

deploy_application() {
  log_info "Deploying application..."
  
  # Create temporary directory for deployment
  DEPLOY_TEMP="/tmp/$APP_NAME-deploy-$(date +%s)"
  run_remote "mkdir -p $DEPLOY_TEMP"
  
  # Copy application files
  log_info "Copying application files..."
  tar --exclude='.git' --exclude='node_modules' --exclude='dist' -czf - . | \
    ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "tar -xzf - -C $DEPLOY_TEMP"
  
  # Install dependencies
  log_info "Installing dependencies..."
  run_remote "cd $DEPLOY_TEMP && bun install --production"
  
  # Build application
  log_info "Building application..."
  run_remote "cd $DEPLOY_TEMP && bun run build"
  
  # Run database migrations
  log_info "Running database migrations..."
  run_remote "cd $DEPLOY_TEMP && DATABASE_URL=postgresql://$APP_USER:$APP_NAME_password@localhost:5432/$APP_NAME bun run scripts/migrate.ts --seed"
  
  # Switch to new deployment
  log_info "Switching to new deployment..."
  run_remote "rm -rf $APP_DIR.old 2>/dev/null || true"
  run_remote "mv $APP_DIR $APP_DIR.old 2>/dev/null || true"
  run_remote "mv $DEPLOY_TEMP $APP_DIR"
  
  # Set permissions
  run_remote_sudo "chown -R $APP_USER:$APP_USER $APP_DIR"
  run_remote_sudo "chmod -R 755 $APP_DIR"
  
  # Clean up
  run_remote "rm -rf $DEPLOY_TEMP"
  
  log_success "Application deployment completed"
}

setup_nginx() {
  log_info "Setting up Nginx..."
  
  # Create Nginx configuration
  NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
  
  cat > /tmp/nginx.conf << EOF
# BotGrocer Nginx Configuration
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (will be set up by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Client settings
    client_max_body_size 100M;
    
    # Proxy to Bun application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API documentation
    location /docs {
        proxy_pass http://localhost:3000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host \$host;
        access_log off;
    }
    
    # Static files (future)
    location /static/ {
        alias $APP_DIR/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
  
  # Copy Nginx configuration
  copy_to_remote "/tmp/nginx.conf" "/tmp/nginx.conf"
  run_remote_sudo "mv /tmp/nginx.conf $NGINX_CONF"
  
  # Enable site
  run_remote_sudo "ln -sf $NGINX_CONF /etc/nginx/sites-enabled/"
  
  # Test Nginx configuration
  run_remote_sudo "nginx -t"
  
  # Reload Nginx
  run_remote_sudo "systemctl reload nginx"
  
  # Set up SSL with Certbot if domain is accessible
  log_info "Setting up SSL certificates..."
  if run_remote "curl -s -o /dev/null -w '%{http_code}' http://$DOMAIN" | grep -q "200\|301\|302"; then
    run_remote_sudo "certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"
    run_remote_sudo "systemctl reload nginx"
  else
    log_warning "Domain $DOMAIN not accessible. SSL setup skipped."
    log_warning "Please run manually: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
  fi
  
  log_success "Nginx setup completed"
}

setup_systemd() {
  log_info "Setting up systemd service..."
  
  # Create systemd service file
  cat > /tmp/botgrocer.service << EOF
[Unit]
Description=BotGrocer AI Agent Marketplace
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://$APP_USER:$APP_NAME_password@localhost:5432/$APP_NAME"
Environment="PORT=3000"
Environment="HOST=0.0.0.0"
ExecStart=/home/$APP_USER/.bun/bin/bun run start
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/app.log
StandardError=append:$LOG_DIR/error.log
SyslogIdentifier=$APP_NAME

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$LOG_DIR $APP_DIR

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
  
  # Copy service file
  copy_to_remote "/tmp/botgrocer.service" "/tmp/botgrocer.service"
  run_remote_sudo "mv /tmp/botgrocer.service /etc/systemd/system/$SERVICE_NAME.service"
  
  # Reload systemd and enable service
  run_remote_sudo "systemctl daemon-reload"
  run_remote_sudo "systemctl enable $SERVICE_NAME"
  run_remote_sudo "systemctl restart $SERVICE_NAME"
  
  # Check service status
  sleep 3
  if run_remote_sudo "systemctl is-active $SERVICE_NAME" | grep -q "active"; then
    log_success "Systemd service started successfully"
  else
    log_error "Failed to start systemd service"
    run_remote_sudo "journalctl -u $SERVICE_NAME -n 50 --no-pager"
    exit 1
  fi
}

verify_deployment() {
  log_info "Verifying deployment..."
  
  # Wait for application to start
  sleep 5
  
  # Check if application is responding
  if run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health" | grep -q "200"; then
    log_success "Application health check passed"
  else
    log_error "Application health check failed"
    run_remote_sudo "journalctl -u $SERVICE_NAME -n 50 --no-pager"
    exit 1
  fi
  
  # Check if Nginx is proxying correctly
  if run_remote "curl -s -o /dev/null -w '%{http_code}' -H 'Host: $DOMAIN' http://localhost/health" | grep -q "200"; then
    log_success "Nginx proxy check passed"
  else
    log_warning "Nginx proxy check failed (may need SSL setup)"
  fi
  
  # Display deployment info
  log_info "Deployment Information:"
  log_info "  Application: http://localhost:3000"
  log_info "  API Docs: http://localhost:3000/docs"
  log_info "  Health: http://localhost:3000/health"
  log_info "  Domain: https://$DOMAIN"
  log_info "  Logs: $LOG_DIR/"
  log_info "  Service: $SERVICE_NAME"
  
  log_success "Deployment verification completed"
}

# ============================================
# Main Deployment Process
# ============================================

main() {
  log_info "Starting BotGrocer deployment to $ENVIRONMENT ($SERVER_HOST)"
  log_info "============================================"
  
  # Execute deployment steps
  check_prerequisites
  setup_server
  setup_database
  deploy_application
  setup_nginx
  setup_systemd
  verify_deployment
  
  log_info "============================================"
  log_success "🎉 BotGrocer deployment completed successfully!"
  log_info ""
  log_info "Next steps:"
  log_info "1. Visit https://$DOMAIN"
  log_info "2. Check logs: ssh $SERVER_USER@$SERVER_HOST 'sudo journalctl -u $SERVICE_NAME -f'"
  log_info "3. Monitor health: https://$DOMAIN/health"
  log_info ""
  log_info "For MCP integration, ensure port 3001 is accessible for AI agents."
}

# Run main function
main "$@"