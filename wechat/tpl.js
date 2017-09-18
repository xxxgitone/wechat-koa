const ejs = require('ejs')
const heredoc = require('heredoc')

const tpl = heredoc(function () {/*
  <xml>
    <ToUserName><![CDATA[<%= ToUserName %>]]></ToUserName>
    <FromUserName><![CDATA[<%= FromUserName %>]]></FromUserName>
    <CreateTime><%= CreateTime %></CreateTime>
    <MsgType><![CDATA[<%= MsgType %>]]></MsgType>

    <% if (MsgType === 'text') { %>
      <Content><![CDATA[<%= content %>]]></Content>
    <% } else if (MsgType === 'image') {%>
      <Image>
        <MediaId><![CDATA[<%= content.Media_id %>]]></MediaId>
      </Image>
    <% } else if (MsgType === 'voice') {%>
      <Voice>
        <MediaId><![CDATA[<%= content.Media_id %>]></MediaId>
      </Voice>
    <% } else if (MsgType === 'video') {%>
      <Video>
        <MediaId><![CDATA[<%= content.Media_id %>]]></MediaId>
        <Title><![CDATA[<%= content.Title %>]]></Title>
        <Description><![CDATA[<%= content.Description %>]]></Description>
      </Video> 
    <% } else if (MsgType === 'music') {%>
      <Music>
        <Title><![CDATA[<%= content.Title %>]]></Title>
        <Description><![CDATA[<%= content.Description %>]]></Description>
        <MusicUrl><![CDATA[<%= content.Music_url %>]]></MusicUrl>
        <HQMusicUrl><![CDATA[<%= content.HQ_MUSIC_Url %>]]></HQMusicUrl>
        <ThumbMediaId><![CDATA[<%= content.Media_id %>]]]></ThumbMediaId>
      </Music>
    <% } else if (MsgType === 'news') {%>
      <ArticleCount><%= content.length %></ArticleCount>
      <Articles>
        <% content.forEach(function(item) {%>
        <item>
          <Title><![CDATA[<%= item.Title %>]]></Title> 
          <Description><![CDATA[<%= item.Description %>]]></Description>
          <PicUrl><![CDATA[<%= item.PicUrl %>]]></PicUrl>
          <Url><![CDATA[<%= item.Url %>]]></Url>
        </item>
        <% }) %>
      </Articles>
    <% } %>
  </xml>
*/})

const compiled = ejs.compile(tpl)
exports = module.exports = {
  compiled: compiled
}
