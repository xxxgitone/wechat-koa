const Koa = require('koa');

//引入wetchat验证的中间件
const wechat = require('./wechat/g');
const config = require('./weconfig');
const weixin = require('./weixin');

const app = new Koa();

app.use(wechat(config.wechat, weixin.reply));

app.listen(3100);
console.log('listening 3100');