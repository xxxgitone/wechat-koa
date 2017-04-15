const xml2js = require('xml2js');
const Promise = require('bluebird');
const tpl = require('./tpl');

exports.parseXMLAsync = function(xml) {
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xml, {trim: true}, function(err, content) {
            if(err) reject(err);
            else resolve(content);
        })
    })
}


function formatMessage(result) {
    let message = {};

    if(typeof result === 'object') {
        const keys = Object.keys(result);
        console.log('keys: ' + keys);

        for(let i = 0; i < keys.length; i++) {
            const item = result[keys[i]];
            const key = keys[i];

            //如果不是数组，或者长度为0
            if(!(item instanceof Array) || item.lenght === 0) {
                continue;
            }

            if(item.length === 1) {
                const val = item[0];

                if(typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else { //最后可能为数组
                message[key] = [];
                for(let j = 0, k = item.lenght; j < k; j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }

    return message;
}

exports.formatMessage = formatMessage

exports.tpl = function(content, message) {
    let info = {};
    let type = 'text';
    const fromUserName = message.FromUserName;
    const toUserName = message.ToUserName;

    if(Array.isArray(content)) {
        type = 'news';
    }

    console.log('content： ' + content);

    type = content.type || type;

    info.content = content;
    info.createTime = Date.now();
    info.msgType = type;
    info.toUserName = fromUserName;
    info.fromUserName = toUserName;

    return tpl.compiled(info);

}