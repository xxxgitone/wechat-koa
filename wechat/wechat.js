
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');
const request = Promise.promisify(require('request'));
const util = require('./util');

const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?'
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?'
    }
}

//获取access_token，access_token是公众号的全局唯一接口调用凭据
//两个小时失效
function Wechat(opts) {
    let that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();
    
}

Wechat.prototype.fetchAccessToken = function() {
    const that = this;

    if(this.access_token && this.expires_in) {
        if(this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }
    this.getAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data); //json化
            }
            catch(e) {
                //有异常的画重新获取
                return that.updateAccessToken(data);
            }

            //判断是否过期
            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data);
            } else {
                // 过期的话重新获取
                return that.updateAccessToken();
            }
        })
        .then(function(data) {
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            //将票据存入
            that.saveAccessToken(data);

            return Promise.resolve(data);
        })
}

/**
 * 判断是否过期
 */
Wechat.prototype.isValidAccessToken = function(data) {
    if(!data || !data.access_token || !data.expires_in) {
        return false;
    }

    let access_token = data.access_token;
    let expires_in = data.expires_in;
    const now = Date.now();

    if(now < expires_in ) {
        return true;
    } else {
        return false;
    }
}

//实现更新
Wechat.prototype.updateAccessToken = function () {
    const appID = this.appID;
    const appSecret = this.appSecret;
    const url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve, reject) {
         //为一个可以发送请求的库
        request({url: url, json: true}).then(function(response) {
            let data = response.body;
            const now = Date.now();
            //提前20s
            let expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;
            resolve(data);
        })

    })
}

//上传文素材
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
    const that = this;
    let form = {};
    //默认为零时素材
    let uploadUrl = api.temporary.upload;

    // 如果传入了参数
    if(permanent) {
        uploadUrl = api.permanent.upload;

        _.assign(form, permanent);
    }

    if(type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }

    if(type === 'news') {
        uploadUrl = api.permanent.uploadNews;

        //如果传入了一个数组
        form = material;
    } else {
        // 如果传入了一个路径
        form.media = fs.createReadStream(material);
    }

    // const appID = this.appID;
    // const appSecret = this.appSecret;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                let url = uploadUrl + 'access_token=' + data.access_token;

                if(!permanent) {
                    url += '&type=' + type;
                } else {
                    form.access_token = data.access_token;
                }

                let options = {
                    method: 'POST',
                    url: url,
                    json: true
                }

                if(type === 'news') {
                    options.body = form;
                } else {
                    options.formData = form;
                }


                request({method: 'POST', url: url, formData: form, json: true}).then(function(response) {
                    console.log('response' + JSON.stringify(response));
                    let _data = response.body;
                    console.log('_data' + JSON.stringify(_data));

                    if(_data) {
                        resolve(_data);
                    } else {
                        throw new Error('Upload material fails');
                    }
                })
                .catch(function(err) {
                    reject(err);
                })
            })
    })
}

Wechat.prototype.reply = function() {
    console.log('body: ' + this.body);
    const content = this.body;
    const message = this.weixin;

    console.log('wechat content: ' + content)


    const xml = util.tpl(content, message);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
}




module.exports = Wechat;