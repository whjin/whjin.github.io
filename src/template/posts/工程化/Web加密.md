## 双 `Token` 认证系统

1. `Access Token`（访问令牌）
   - **用途**：用于访问受保护的 `API` 资源，附加在每个请求的 `Header` 中
   - **特点**：生命周期短（1小时），无状态，服务器无需存储
   - **存储**：通常存储在客户端内存中，需要频繁读取
2. `Refresh Token`（刷新令牌）
   - **用途**：当 `Access Token` 过期时，专门用于获取一个新的 `Access Token`
   - **特点**：生命周期长（7天或30天），与特定用户绑定，服务器需要安全存储其有效性记录
   - **存储**：必须安全存储。**最佳实践时存储在 `HttpOnly Cookie` 中**，可以防止客户端 `JavaScript`（`XSS`攻击） 脚本读取

`Access Token`无状态，服务器无需记录，`JWT`无法主动吊销，`Refresh Token`有状态，服务器需要一个列表记录，当用户更改密码或主动登出时，服务器可以主动将对应的 `Refresh Token`设为无效。

## 加密方式

**`md5 hash + salt`**

`salt`在密码学中是指在 `hash`之前将明文内容的任意固定位置插入特定的字符串。

**`bcrybt`**

一种加盐（`salt`）的单向 `hash`，不可逆的加密算法，同一种明文 `plaintext`，每次加密后的密文都不一样，而且不可反向破解生成明文，破解难度很大。

## `Cookie`

**生命周期**

```cookie
Set-Cookie: id=a3fWa; Expires=Thu, 18 Dec 2013 12:00:00 GMT;
```

**`cookie`安全性**

- `Secure`：只通过被 `https`协议加密过的请求发送给服务端
- `HttpOnly`：无法使用 `javaScript` 对它进行访问。key有效缓解 `xss`攻击
- `document.cookie` 无法访问到对应的数据

```cookie
Set-Cookie: id=a3fWa; Expires=Thu, 18 Dec 2013 12:00:00 GMT; Secure; HttpOnly;
```

**作用域**

- `Domain`：指定了哪些主机可以接受 `cookie`，如果不指定，默认为 `origin`，不包括子域名
- `Path`：标识指定了主机下的哪些路径可以接受 `cookie`

**`SameSite`**
`SameSite Cokie`允许服务器要求某个 `cookie`在跨站请求时不会被发送，可以阻止跨站请求伪造攻击（`Cross-Site Request Forgery`，简称 `CSRF`）。

`None` `Stict` `Lax`
