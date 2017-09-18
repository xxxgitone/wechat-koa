module.exports = {
  button: [
    {
      name: '点击事件',
      type: 'click',
      key: 'menu_click',
    },
    {
      name: '点击菜单',
      sub_button: [
        {
          type: 'view',
          name: '跳转URL',
          url: 'http://wechat.xxxuthus.cn:3100/movie'
        },
        {
          type: 'scancode_push',
          name: '扫码推送事件',
          key: 'qr_scan'
        },
        {
          name: '扫码推送中',
          type: 'scancode_waitmsg',
          key: 'qr_scan_wait'
        },
        {
          name: '弹出系统拍照',
          type: 'pic_sysphoto',
          key: 'pic_photo'
        },
        {
          name: '弹出拍照或者相册',
          type: 'pic_photo_or_album',
          key: 'pic_photo_album'
        }
      ]
    },
    {
      name: '点击菜单',
      sub_button: [
        {
          type: 'pic_weixin', 
          name: '微信相册发图', 
          key: 'pic_weixin', 
        },
        {
          name: '发送位置', 
          type: 'location_select', 
          key: 'location_select'
        }
        // {
        //   type: 'media_id', 
        //   name: '图片', 
        //   media_id: 'MEDIA_ID1'
        // },
        // {
        //   type: 'view_limited', 
        //   name: '图文消息', 
        //   media_id: 'MEDIA_ID2'
        // }
      ]
    }
  ]
}