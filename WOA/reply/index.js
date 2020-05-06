const config = require('../config')
const sha1 = require('sha1')
const template = require('./template')
const { writeFileAsync, readFileAsync } = require('../utils/tools')
const { getUserDataAsync, parseXMLAsync, formatMassageAsync } = require('../utils/tools')
module.exports = () => {
    return async (req, res, next) => {
        /*
            1.验证服务器的有效性(消息是否来自微信服务器)
                + ngrok、natapp内网穿透
                + 配置服务（验证）
        */
        const { signature, echostr, timestamp, nonce } = req.query
        const { token } = config
        const sha1Str = sha1([timestamp, nonce, token].sort().join(''))
        if (req.method === 'GET') {
            if (sha1Str === signature) {
                res.send(echostr)
            } else {
                res.end('error111')
            }
        } else if (req.method === 'POST') {
            if (sha1Str !== signature) {
                return res.end('error')
            }
            /*
                接收来自用户的消息
                由于数据是以流的方式传送
                    + getUserDateAsync() 将数据存储为xmldata
                    + parseXMLAsync() 将xmldata存储为jsdata
                    + formatMassageAsync 将数据格式化为自己要的形式
            */
            const xmlData = await getUserDataAsync(req)
            //console.log(xmlData)
            const jsData = await parseXMLAsync(xmlData)
            //console.log(jsData)
            const message = await formatMassageAsync(jsData)
            //console.log(message)
            /*  
                创建回复消息的信息  
            */
            let options = {
                ToUserName: message.FromUserName,
                FromUserName: message.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'text'
            }
            let content = `👉功能介绍👈\n回复 博客 进入网站\n回复 今日热点 随机返回一条热点信息\n回复 今日笔记 返回作者昨天的笔记`;
            if (message.MsgType === 'text') {
                if (message.Content === '博客') {
                    options.MsgType = 'news'
                    content = []
                    //https://mp.weixin.qq.com/mp/homepage?__biz=MzI0OTE4Mzc0Nw==&hid=1&sn=11eb21c89ccf791db2c4619f10ba0826
                    content.push({
                        title: '进入博客网站(jsky)',
                        description: '这是私人博客网站，你可以发表自己的博客文章和搜索相关',
                        picUrl: `https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3369544665,3799492039&fm=26&gp=0.jpg`,
                        url: `http://www.jsky.org.cn`
                    })
                } else if (message.Content === '今日热点') {
                    options.MsgType = 'news'
                    content = []
                    content.push({
                        title: '热点信息',
                        description: '热点介绍',
                        picUrl: `http://www.jsky.org.cn/today/hot`,
                        url: `http://www.jsky.org.cn/today/hot/head.png`
                    })
                } else if (message.Content === '今日笔记') {
                    options.MsgType = 'news'
                    content = []
                    content.push({
                        title: '热点信息',
                        description: '热点介绍',
                        picUrl: `http://www.jsky.org.cn/today/note/head.png`,
                        url: `http://www.jsky.org.cn/today/note`
                    })
                }
            }
            options.Content = content
            /*
                将消息加入模板（微信回复消息有一定的格式），并发送给用户
            */
            let replyMessage = template(options)
            console.log(replyMessage)
            res.send(replyMessage)
        }
    }
}