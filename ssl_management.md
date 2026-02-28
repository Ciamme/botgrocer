# BotGrocer.com SSL证书管理文档

## 📋 证书信息

### 基本信息
- **域名**: botgrocer.com, www.botgrocer.com
- **颁发机构**: Let's Encrypt
- **证书类型**: DV (Domain Validation)
- **有效期**: 90天
- **当前有效期**: 2026-02-27 至 2026-05-28

### 技术详情
- **加密协议**: TLS 1.2/1.3
- **HTTP版本**: HTTP/2
- **证书路径**: `/etc/letsencrypt/live/www.botgrocer.com/`
- **配置文件**: `/etc/letsencrypt/renewal/www.botgrocer.com.conf`

## 🔧 自动续订配置

### Cron任务
```bash
# 自动续订配置
0 0,12 * * * root /usr/bin/certbot renew --quiet
```

### 续订策略
- **检查频率**: 每天2次 (UTC 00:00 和 12:00)
- **续订阈值**: 到期前30天自动续订
- **重载服务**: 续订后自动重载Nginx
- **静默模式**: `--quiet` 参数避免不必要的输出

## 🛠️ 手动管理命令

### 检查证书状态
```bash
# 查看所有证书
certbot certificates

# 检查特定证书
certbot certificates --domain botgrocer.com

# 验证证书链
openssl s_client -connect botgrocer.com:443 -servername botgrocer.com < /dev/null 2>/dev/null | openssl x509 -noout -text
```

### 手动续订
```bash
# 测试续订 (不实际执行)
certbot renew --dry-run

# 强制立即续订
certbot renew --force-renewal

# 续订特定证书
certbot renew --cert-name www.botgrocer.com
```

### 证书文件
```bash
# 证书文件位置
/etc/letsencrypt/live/www.botgrocer.com/
├── cert.pem          # 证书
├── chain.pem         # 中间证书
├── fullchain.pem     # 完整证书链
└── privkey.pem       # 私钥

# Nginx使用的文件
ssl_certificate: /etc/letsencrypt/live/www.botgrocer.com/fullchain.pem
ssl_certificate_key: /etc/letsencrypt/live/www.botgrocer.com/privkey.pem
```

## 🚨 故障排除

### 常见问题

#### 1. 续订失败
```bash
# 查看详细错误
certbot renew --verbose

# 检查Nginx配置
nginx -t

# 检查证书权限
ls -la /etc/letsencrypt/live/www.botgrocer.com/
```

#### 2. 证书过期
```bash
# 检查到期时间
echo | openssl s_client -connect botgrocer.com:443 -servername botgrocer.com 2>/dev/null | openssl x509 -noout -dates

# 强制续订过期证书
certbot renew --force-renewal
```

#### 3. Nginx配置问题
```bash
# 测试Nginx配置
nginx -t

# 重载Nginx
systemctl reload nginx

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 监控命令
```bash
# 监控证书状态
echo "证书状态:"
echo | openssl s_client -connect botgrocer.com:443 -servername botgrocer.com 2>/dev/null | openssl x509 -noout -subject -dates

# 监控续订日志
grep certbot /var/log/syslog | tail -20
```

## 📊 证书生命周期管理

### 时间线
```
证书颁发: 2026-02-27
首次检查: 2026-03-29 (30天后)
自动续订: 2026-04-28 (到期前30天)
证书过期: 2026-05-28
```

### 续订流程
1. **每天检查**: Cron任务检查证书状态
2. **到期判断**: 如果剩余时间 ≤ 30天，触发续订
3. **验证域名**: 通过HTTP-01挑战验证域名所有权
4. **颁发新证书**: Let's Encrypt颁发新证书
5. **更新文件**: 替换证书文件
6. **重载服务**: 自动重载Nginx使新证书生效

## 🔐 安全最佳实践

### 证书安全
1. **私钥保护**: 私钥文件权限为600 (仅root可读)
2. **自动续订**: 避免手动操作导致的过期
3. **监控告警**: 设置证书到期监控
4. **备份策略**: 定期备份证书和私钥

### Nginx配置
```nginx
# 安全SSL配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
```

## 📈 监控和告警

### 监控指标
1. **证书有效期**: 剩余天数监控
2. **续订状态**: 最近续订是否成功
3. **服务状态**: HTTPS服务可用性
4. **加密强度**: TLS协议版本和密码套件

### 告警阈值
- **警告**: 证书剩余 ≤ 15天
- **严重**: 证书剩余 ≤ 7天
- **紧急**: 证书剩余 ≤ 3天 或 已过期

## 📝 维护记录

### 2026-02-28
- ✅ 初始SSL证书配置完成
- ✅ Certbot自动续订已启用
- ✅ Nginx HTTPS配置完成
- ✅ HTTP到HTTPS重定向配置完成
- ✅ 证书有效期: 2026-02-27 至 2026-05-28

### 下次维护
- **自动续订检查**: 每天UTC 00:00 和 12:00
- **手动检查建议**: 每月检查一次证书状态
- **备份建议**: 每季度备份证书文件

---

**最后更新**: 2026-02-28  
**维护者**: nanobot 🐈  
**状态**: ✅ 生产环境运行正常