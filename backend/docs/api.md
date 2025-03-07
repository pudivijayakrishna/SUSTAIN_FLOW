# API Documentation

## Document Resubmission and OTP Verification

### Send OTP 

## Notes

1. Document Requirements:
   - File type: PDF only
   - Maximum size: 5MB
   - One file per submission

2. OTP Validation:
   - 6-digit numeric code
   - Valid for 2 minutes
   - Maximum 2 resend attempts

3. Submission Attempts:
   - Maximum 3 total attempts per user
   - Attempts count persists across sessions
   - After 3 attempts, manual intervention required

4. Security Measures:
   - Rate limiting per IP and email
   - OTP expiry after 2 minutes
   - Document validation
   - Token-based authentication

5. Email Notifications:
   - OTP sent to user email
   - Admin notified of resubmissions
   - Alert when max attempts reached

## Deployment Considerations

### 1. Environment Setup
- **Environment Variables:**
  ```env
  NODE_ENV=production
  PORT=8000
  MONGODB_URI=mongodb://...
  JWT_SECRET=your_secret_key
  FRONTEND_URL=https://your-frontend-url
  ADMIN_EMAIL=admin@example.com
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email
  SMTP_PASS=your-app-password
  ```

### 2. Security Configuration
- Enable HTTPS in production
- Set secure cookie options
- Configure CORS properly:
  ```javascript
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
  ```

### 3. Performance Optimization
- **Memory Management:**
  - Configure OTP store cleanup
  - Set appropriate document size limits
  - Implement caching for frequent requests

- **Rate Limiting:**
  ```javascript
  // Configure rate limiters based on server capacity
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
  ```

### 4. Monitoring & Logging
- Implement health check endpoint:
  ```javascript
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });
  ```
- Set up error tracking
- Configure access logs
- Monitor rate limit hits

### 5. Scaling Considerations
- **Horizontal Scaling:**
  - Use Redis for OTP store in clustered environment
  - Implement sticky sessions if needed
  - Configure load balancer health checks

- **Database Optimization:**
  - Index frequently queried fields
  - Set up database monitoring
  - Configure connection pooling

### 6. Backup & Recovery
- Regular database backups
- Document version control
- Implement rollback procedures

### 7. Maintenance
- **Zero-Downtime Updates:**
  ```bash
  # Example PM2 deployment
  pm2 start ecosystem.config.js --env production
  pm2 reload all 0
  ```
- Schedule maintenance windows
- Set up automated health checks

### 8. Error Handling
- Implement global error handler:
  ```javascript
  app.use((err, req, res, next) => {
    logger.error({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method
    });

    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });
  ```

### 9. SSL/TLS Configuration

Example Nginx configuration
server {
listen 443 ssl;
server_name your-domain.com;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
location / {
proxy_pass http://localhost:8000;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
}
}


### 10. Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring tools set up
- [ ] Rate limits configured
- [ ] Error logging enabled
- [ ] Security headers set
- [ ] CORS configured
- [ ] Health checks implemented
- [ ] Load balancer configured

### 11. Troubleshooting
Common issues and solutions:
1. **OTP not received:**
   - Check SMTP configuration
   - Verify email service provider limits
   - Check spam folders

2. **Rate limit issues:**
   - Adjust limits based on usage patterns
   - Implement IP whitelisting if needed
   - Monitor for abuse

3. **Document upload failures:**
   - Check file size limits
   - Verify storage permissions
   - Monitor disk space

4. **Performance issues:**
   - Monitor server resources
   - Check database query performance
   - Optimize file handling



   


   password reset:

  The flow will now be:
1. User enters new password and confirms it
2. System shows OTP verification step
3. User requests OTP (sent to their email)
4. User enters OTP
5. If OTP is valid, password is reset