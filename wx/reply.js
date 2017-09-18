const config = require('../config')
const Wechat = require('../wechat/wechat')
const path = require('path')
const menu = require('./menu')
const wechatApi = new Wechat(config.wechat)

wechatApi.deleteMenu().then(() => {
  return wechatApi.createMenu(menu)
}).then((msg) => {
  console.log(msg)
})

/**
 * 根据用户的请求信息，返回相应的内容
 */
exports.reply = async (ctx, next) => {
  const message = ctx.weixin
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('扫毛二维码: ' + message.EventKey + ' ' + message.Ticket)
      }
      ctx.body = '欢迎订阅～'
    } else if (message.Event === 'unsubscribe') {
      ctx.body= ''
      console.log('取消关注')
    } else if (message.Event === 'LOCATION') {
      ctx.bdy = `您上报的位置是: ${message.Latitude}/${message.Longitude}-${message.Precision}`
    } else if (message.Event === 'CLICK') {
      ctx.body = `您点击了菜单: ${message.EventKey}`
    } else if (message.Event === 'SCAN') {
      console.log(`关注后扫二维码${message.EventKey} ${message.Ticket}`)
      ctx.body = '看到你扫了一下哦'
    } else if (message.Event === 'VIEW') {
      ctx.body = `您点击的链接: ${message.EventKey}`
    } else if (message.Event === 'scancode_push') {
      console.log(message.ScanCodeInfo.ScanType)
      console.log(message.ScanResult)
      ctx.body = `您点击了菜单: ${message.EventKey}`
    } else if (message.Event === 'scancode_waitmsg') {
      console.log(message.ScanCodeInfo.ScanType)
      console.log(message.ScanResult.ScanResult)
      ctx.body = `您点击了菜单: ${message.EventKey}`
    } else if (message.Event === 'pic_sysphoto') {
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      ctx.body = `您点击了菜单: ${message.EventKey}`
    } else if (message.Event === 'pic_photo_or_album') {
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      ctx.body = `您点击了菜单: ${message.EventKey}`
    } else if (message.Event === 'pic_weixin') {
      ctx.body = `您点击了菜单: ${message.EventKey}`
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
    } else if (message.Event === 'location_select') {
      ctx.body = `您点击了菜单: ${message.EventKey}`
      console.log(message.SendLocationInfo.Location_X)
      console.log(message.SendLocationInfo.Location_Y)
      console.log(message.SendLocationInfo.Scale)
      console.log(message.SendLocationInfo.Label)
      console.log(message.SendLocationInfo.Poiname)
    } 
  } else if (message.MsgType === 'text'){
    const content = message.Content
    let reply = `您的话是: ${message.Content}`

    if (content === '1') {
      reply = '1'
    } else if (content === '2') {
      reply = '2'
    } else if (content === '3') {
      reply = '3'
    } else if (content === '4') {
      reply = [{
        Title: 'github',
        Description: '最大的同性交友网站',
        PicUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1505490329240&di=92852ad01eb3da50aa52aa3cb2de7d7c&imgtype=0&src=http%3A%2F%2Fwww.embeddedlinux.org.cn%2Fuploads%2Fallimg%2F151115%2F0934120.jpg',
        Url: 'https://github.com/xxxgitone'
      }]
    } else if (content === '5') {
      const data = await wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'))
      reply = {
        type: 'image',
        Media_id: data.media_id
      }
    } else if (content === '6') {
      const data = await wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {type: 'image'})
      console.log(data)
      reply = {
        type: 'image',
        Media_id: data.media_id
      }
    } else if (content === '7') {
      const picData = await wechatApi.uploadMaterial('image', path.join( __dirname, '../2.jpg'), {})
      console.log(picData)

      let media = {
        articles: [{
          title: 'GITHUB',
          thumb_media_id: picData.media_id,
          author: 'xuthus',
          digest: '简单摘要',
          show_cover_pic: 1,
          content: '全球最大的同性交友网站',
          content_source_url: 'https://github.com/xxxgitone'
        },{
          title: 'GITHUB1',
          thumb_media_id: picData.media_id,
          author: 'xuthus',
          digest: '简单摘要',
          show_cover_pic: 1,
          content: '全球最大的同性交友网站',
          content_source_url: 'https://github.com/xxxgitone'
        }]
      }
      
      data = await wechatApi.uploadMaterial('news', media, {})
      console.log(data)
      data = await wechatApi.fetchMaterial(data.media_id, 'news', {})
      console.log(data)

      const items = data.news_item
      let news = []

      items.forEach((item) => {
        news.push({
          Title: item.title,
          Description: item.content,
          PicUrl: picData.url,
          Url: item.url
        })
      })
      reply = news
    } else if (content === '8') {
      const counts = await wechatApi.countMaterial()
      console.log(JSON.stringify(counts))

      const list = await wechatApi.batchMaterial({
        type: 'image',
        offset: 0,
        count: 10,
      })
      const list2 = await wechatApi.batchMaterial({
        type: 'news',
        offset: 0,
        count: 10,
      })
      console.log(list)
      console.log(list2)

      reply = '素材'
    } else if (content === '9') {
      const tag = await wechatApi.createTags('wechat')
      console.log('新分组')

      const tags = await wechatApi.fetchTags()
      console.log(tags)

      reply = '分组'
    } else if (content === '10') {
      const user = await wechatApi.fetchUsers(message.FromUserName)
      console.log(user)

      const openIds = [
        {
          openid: message.FromUserName, 
          lang: 'en'
        }
      ]

      const users = await wechatApi.fetchUsers(openIds)

      console.log(users)

      reply = JSON.stringify(user)
    } else if (content === '11') {
      const userList = await wechatApi.listUsers()
      console.log(userList)
      reply = userList.total
    } else if (content === '12') {
      const mpnews = {
        media_id: 'TM1UUnceeDG6AGP6pnrgEM9jxhvgu6VQCjkShMiNzIs'
      }
      const msgData = await wechatApi.sendByTag('mpnews', mpnews)
      console.log(msgData)
      reply = 'Yeah'
    }

    ctx.body = reply
  }
  await next()
}