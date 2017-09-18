const Koa = require('koa')
const crypto = require('crypto')
const app = new Koa()
const reply = require('./wx/reply')
const wechat = require('./wechat/verification')
const config = require('./config')
const Wechat = require('./wechat/wechat')

const ejs = require('ejs')
const heredoc = require('heredoc')

const tpl = heredoc(() => {/*
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>搜电影</title>
  </head>
  <body>
    <h1>点击标题，开始录音翻译</h1>
    <p id="title"></p>
    <div id="director"></div>
    <div id="year"></div>
    <div id="poster"></div>
    <script src="http://zeptojs.com/zepto-docs.min.js"></script>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
    <script>
      wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: 'wxb37838238b63dfad', // 必填，公众号的唯一标识
        timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
        nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
        signature: '<%= signature %>',// 必填，签名，见附录1
        jsApiList: [
          'startRecord',
          'stopRecord',
          'onVoiceRecordEnd',
          'translateVoice'
        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      })

      wx.ready(function(){
        wx.checkJsApi({
          jsApiList: ['onVoiceRecordEnd'],
          success: function(res) {
            console.log(res)
          }
        })

        var isRecording = false

        $('h1').on('tap', function () {
          if (!isRecording) {
            isRecording = true
            wx.startRecord({
              cancle: function () {
                window.alert('那就不能搜索了')
              }
            })
            return
          }

          isRecording = false
          wx.stopRecord({
              success: function (res) {
                var localId = res.localId;
                wx.translateVoice({
                  localId: localId, 
                  isShowProgressTips: 1,
                  success: function (res) {
                    var result = res.translateResult
                    $.ajax({
                      type: 'get',
                      url: 'https://api.douban.com//v2/movie/search?q=' + result,
                      dataType: 'jsonp',
                      jsonp: 'callback',
                      success: function (data) {
                        console.log(data)
                        var subject = data.subjects[0]

                        $('#director').html(subject.directors[0].name)
                        $('#title').html(subject.title)
                        $('#year').html(subject.year)
                        $('#poster').html('<img src="' + subject.images.large + '"/>>')
                      }
                    })
                  }
                });
              }
          });
        })
      })
    </script>
  </body>
</html>
*/})

const createNonce = () => {
  return Math.random().toString(36).substr(2, 15)
}

const createTimestamp = () => {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

const _sign = (noncestr, ticket, timestamp, url) => {
  const params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]
  const str = params.sort().join('&')
  console.log(str)
  const shasum = crypto.createHash('sha1')
  shasum.update(str)
  return shasum.digest('hex')
}

function sign (ticket, url) {
  const noncestr = createNonce()
  const timestamp = createTimestamp()
  const signature = _sign(noncestr, ticket, timestamp, url)
  console.log(ticket)
  console.log(url)
  return {
    noncestr,
    timestamp,
    signature
  }
}

app.use(async (ctx, next) => {
  if (ctx.url.indexOf('/movie') > -1) {
    const WechatApi = new Wechat(config.wechat)
    const data = await WechatApi.fetchAccessToken()
    const access_token = data.access_token
    const ticketData = await WechatApi.fetchTicket(access_token)
    const ticket = ticketData.ticket
    const url = ctx.href
    // const url = ctx.href.replace(':3100', '')
    const params = sign(ticket, url)

    console.log(params)

    ctx.body = ejs.render(tpl, params)

    return next
  }

  await next()
})

app.use(wechat(config.wechat, reply.reply))

app.listen(3100)
console.log('Listening: 3100')