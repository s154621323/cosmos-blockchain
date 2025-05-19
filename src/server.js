const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Blockchain, Transaction, Wallet } = require('./blockchain');

const app = express();
app.use(bodyParser.json());

// 添加静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 创建区块链实例
const myCoin = new Blockchain();

// 存储所有钱包
const wallets = {};

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 获取完整的区块链
app.get('/blockchain', (req, res) => {
  res.json(myCoin);
});

// 获取所有区块
app.get('/blocks', (req, res) => {
  res.json(myCoin.chain);
});

// 获取特定区块
app.get('/blocks/:index', (req, res) => {
  const blockIndex = parseInt(req.params.index);
  if (blockIndex < 0 || blockIndex >= myCoin.chain.length) {
    return res.status(404).json({ error: '区块不存在' });
  }
  res.json(myCoin.chain[blockIndex]);
});

// 获取待处理交易
app.get('/pending-transactions', (req, res) => {
  res.json(myCoin.pendingTransactions);
});

// 创建新钱包
app.post('/wallets', (req, res) => {
  const wallet = new Wallet();
  wallets[wallet.publicKey] = wallet;

  res.json({
    address: wallet.publicKey,
    privateKey: wallet.privateKey,
    message: '请妥善保管您的私钥!'
  });
});

// 获取钱包余额
app.get('/wallets/:address/balance', (req, res) => {
  const address = req.params.address;
  const balance = myCoin.getBalanceOfAddress(address);

  res.json({
    address,
    balance
  });
});

// 创建交易
app.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, privateKey } = req.body;

  if (!fromAddress || !toAddress || !amount || !privateKey) {
    return res.status(400).json({ error: '请提供所有必要的交易信息' });
  }

  const wallet = Object.values(wallets).find(w => w.publicKey === fromAddress && w.privateKey === privateKey);

  if (!wallet) {
    return res.status(401).json({ error: '钱包认证失败' });
  }

  try {
    const transaction = wallet.createTransaction(toAddress, amount, myCoin);
    myCoin.addTransaction(transaction);

    res.json({
      message: '交易添加成功，等待挖矿确认',
      transaction
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 开始挖矿
app.post('/mine', (req, res) => {
  const { minerAddress } = req.body;

  if (!minerAddress) {
    return res.status(400).json({ error: '请提供挖矿奖励地址' });
  }

  // 如果没有待处理交易，添加一个测试交易
  if (myCoin.pendingTransactions.length === 0) {
    myCoin.pendingTransactions.push(new Transaction(null, minerAddress, 1));
  }

  console.log('开始挖矿...');
  myCoin.minePendingTransactions(minerAddress);

  res.json({
    message: '挖矿成功！',
    block: myCoin.chain[myCoin.chain.length - 1],
    balance: myCoin.getBalanceOfAddress(minerAddress)
  });
});

// 验证区块链
app.get('/validate', (req, res) => {
  const isValid = myCoin.isChainValid();

  if (isValid) {
    res.json({ valid: true, message: '区块链验证通过' });
  } else {
    res.json({ valid: false, message: '区块链无效！' });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app; 