const sha1 = require('sha1')
const getRawBody = require('raw-body')
const Wechat = require('./wechat')
const util = require('./util')

module.exports = (opts, handler) => {
  const wechat = new Wechat(opts)
  return async (ctx, next) => {
    const token = opts.token
    const {
      signature, 
      timestamp, 
      nonce, 
      echostr
    } = ctx.request.query
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    
    // 微信第一次通过get请求验证身份
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr + ''
      } else {
        ctx.body = 'wrong'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = 'wrong'
        return false
      }
      // 接受用户POST请求过来的数据XML格式
      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })

      // 解析成对象形式
      const content = await util.parseXMLAsync(data)

      // 上面解析过后值都是数组形式，继续转换成单个值形式
      const message = util.formatMessage(content.xml)
      console.log(message)

      // 将解析出来的内容挂载到ctx上
      ctx.weixin = message
      
      // 业务逻辑转换到另外一个中间件，就是传入的weixin.reply
      await handler(ctx, next)

      // 当上面await处理完后，执行，回复
      wechat.reply(ctx)
    }
  }
}