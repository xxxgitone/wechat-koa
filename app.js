const Koa = require('koa');
const sha1 = require('sha1');

const config = require('./weconfig');

const app = new Koa();

app.use(function *(next) {
    console.log(this.query);

    const token = config.wechat.token;

    //微信发送get请求传过来的数据
    const signature = this.query.signature;
    const nonce = this.query.nonce;
    const timestamp = this.query.timestamp;
    const echostr = this.query.echostr;

    // 将token、timestamp、nonce三个参数进行字典序排序
    const str = [token, timestamp, nonce].sort().join('');

    // 将三个参数字符串拼接成一个字符串进行sha1加密
    const sha = sha1(str);

    // 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if(sha === signature) {
        this.body = echostr + '';
    } else {
        this.body = 'wrong';
    }

    
})

app.listen(3100);
console.log('listening 3100');