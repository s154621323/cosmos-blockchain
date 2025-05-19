const cryptoJs = require('crypto-js');
const { randomBytes } = require('crypto');

// 区块结构
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash () {
    return cryptoJs.SHA256(
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
    ).toString();
  }

  // 工作量证明 (挖矿)
  mineBlock (difficulty) {
    const target = Array(difficulty + 1).join('0');

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`区块已挖出: ${this.hash}`);
  }
}

// 交易结构
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = '';
  }

  // 计算交易的哈希值
  calculateHash () {
    return cryptoJs.SHA256(
      this.fromAddress +
      this.toAddress +
      this.amount +
      this.timestamp
    ).toString();
  }

  // 使用私钥签名交易
  signTransaction (signingKey) {
    // 在实际应用中，这里应该使用真正的加密签名
    // 简化版：我们只是存储签名字符串
    const hashTx = this.calculateHash();
    this.signature = signingKey + ':' + hashTx;
  }

  // 验证交易签名
  isValid () {
    // 如果是挖矿奖励交易，跳过验证
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('没有签名，交易无效');
    }

    // 在实际应用中，这里应该验证签名
    // 简化版本
    return true;
  }
}

// 区块链
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // 挖矿难度
    this.pendingTransactions = [];
    this.miningReward = 100; // 挖矿奖励
  }

  // 创建创世区块
  createGenesisBlock () {
    return new Block(Date.now(), [], '0');
  }

  // 获取最新区块
  getLatestBlock () {
    return this.chain[this.chain.length - 1];
  }

  // 添加交易到待处理列表
  addTransaction (transaction) {
    // 验证交易有效性
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('交易必须包含发送方和接收方地址');
    }

    if (!transaction.isValid()) {
      throw new Error('无法添加无效交易到区块链');
    }

    this.pendingTransactions.push(transaction);
  }

  // 挖掘待处理交易
  minePendingTransactions (miningRewardAddress) {
    // 将所有待处理交易打包到新区块
    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    // 挖矿
    block.mineBlock(this.difficulty);

    // 将新区块添加到链中
    this.chain.push(block);

    // 重设待处理交易，并添加挖矿奖励交易
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  // 获取账户余额
  getBalanceOfAddress (address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  // 验证区块链完整性
  isChainValid () {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 验证区块自身哈希值
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // 验证区块链接
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // 验证区块中的所有交易
      for (const tx of currentBlock.transactions) {
        if (!tx.isValid()) {
          return false;
        }
      }
    }
    return true;
  }
}

// 钱包类
class Wallet {
  constructor() {
    // 在实际应用中，这里应该生成公私钥对
    // 简化版：只生成一个随机ID
    this.publicKey = this.generateId();
    this.privateKey = this.generateId();
  }

  generateId () {
    return randomBytes(32).toString('hex');
  }

  // 创建交易
  createTransaction (toAddress, amount, blockchain) {
    const balance = blockchain.getBalanceOfAddress(this.publicKey);

    if (amount > balance) {
      throw new Error('余额不足，交易失败');
    }

    const tx = new Transaction(this.publicKey, toAddress, amount);
    tx.signTransaction(this.privateKey);
    return tx;
  }
}

module.exports = { Blockchain, Transaction, Block, Wallet };