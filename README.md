# 我的区块链

这是一个基于 CosmJS 设计的简单区块链应用，具有基本的挖矿和交易功能。

## 功能特点

- 基于工作量证明(PoW)的区块挖掘
- 交易系统
- 钱包管理
- 账户余额查询
- 区块链验证

## 安装

```bash
# 克隆项目
git clone [仓库地址]
cd cosmos

# 安装依赖
npm install
```

## 运行

```bash
# 启动服务器
npm start
```

服务器将在 http://localhost:3000 上运行。

## API 接口

### 区块链操作

- `GET /blockchain` - 获取完整区块链信息
- `GET /blocks` - 获取所有区块
- `GET /blocks/:index` - 获取特定区块
- `GET /pending-transactions` - 获取待处理交易
- `GET /validate` - 验证区块链完整性

### 钱包操作

- `POST /wallets` - 创建新钱包
- `GET /wallets/:address/balance` - 获取钱包余额

### 交易操作

- `POST /transactions` - 创建新交易
  - 请求体: `{ fromAddress, toAddress, amount, privateKey }`
  
### 挖矿

- `POST /mine` - 开始挖矿
  - 请求体: `{ minerAddress }`

## 使用示例

### 1. 创建钱包

```
POST /wallets
```

响应:
```json
{
  "address": "钱包公钥地址",
  "privateKey": "钱包私钥",
  "message": "请妥善保管您的私钥!"
}
```

### 2. 挖矿获取初始代币

```
POST /mine
Content-Type: application/json

{
  "minerAddress": "钱包公钥地址"
}
```

### 3. 创建交易

```
POST /transactions
Content-Type: application/json

{
  "fromAddress": "发送方钱包地址",
  "toAddress": "接收方钱包地址",
  "amount": 交易金额,
  "privateKey": "发送方钱包私钥"
}
```

### 4. 确认交易（再次挖矿）

```
POST /mine
Content-Type: application/json

{
  "minerAddress": "矿工钱包地址"
}
```

## 许可证

MIT 