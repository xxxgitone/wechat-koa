const sha1 = require('sha1');
const getRawBody = require('raw-body');
const Wechat = require('./wechat');


//一个验证的中间件
module.exports = function(opts) {
    let wechat = new Wechat(opts);

    return function *(next) {
        console.log(this.query);

        const token = opts.token;

        //微信发送get请求传过来的数据
        const signature = this.query.signature;
        const nonce = this.query.nonce;
        const timestamp = this.query.timestamp;
        const echostr = this.query.echostr;

        // 将token、timestamp、nonce三个参数进行字典序排序
        const str = [token, timestamp, nonce].sort().join('');

        // 将三个参数字符串拼接成一个字符串进行sha1加密
        const sha = sha1(str);

        if (this.methods === 'GET') {
            // 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
            if(sha === signature) {
                this.body = echostr + '';
            } else {
                this.body = 'wrong';
            }
        } else if(this.methods === 'POST'){//用户发送过来的请求
            if(sha !== signature) {
                this.body = 'wrong';
                return false;
            } 

            //getRawBody处理请求的数据，用户请求过来的是xml格式的数据
            const data = yield getRawBody(this.req, {
                lenght: this.lenght,
                limit: '1mb',
                encoding: this.charset
            });

            console.log(data.toString());

        }
    
    }
}