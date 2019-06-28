# Tech
- koa
- mongoose
- mysql
- jwt

# Knowledge
- HTTP options
  - check allowed HTTP methods
  - CORS 中的预检请求

- regex
  - const userId = ctx.url.match(/\/users\/(\w+)/)[1];   // () 代表其中的值加入返回的数组

# Steps and points

## Comments and multi-level nesting
- 三级路由的设计
- 自评论的设计技巧
- 通过 Nginx 反向代理端口到 80

## Nginx 的其他功能
- 负载均衡
- gzip 压缩
- 缓存

## Nginx 反向代理配置
- nginx -t

```conf
server {
  listen 80;
  server_name localhost;
  location / {
    proxy_pass http://127.0.0.1:3000;
  }
}
```

## pm2 
- NODE_ENV=production pm2 start app --update-env --log-date-format "YYYY-MM-DD HH:mm"
- pm2 log --appname
- 

## 未来的探索
- egg.js
- multi-processed programming
- log and process monitor
