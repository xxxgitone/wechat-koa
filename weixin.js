exports.reply = function *(next) {
    const message = this.weixin;
    console.log('message：' + message)

    if(message.MsgType === 'event') {
        if(message.Event === 'subscribe') {
            if(message.EventKey) {
                console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket);
            }

            this.body = '哈哈，你订阅了个号\r\n';
        } else if(message.Event === 'unsubscribe') {
            console.log('取关');
            this.body = '';
        }
    } else {

    }

    yield next;
}