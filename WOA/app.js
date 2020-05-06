const reply=require('./reply')
const Wechat=require('./wechat/wechat')

var express = require('express')


const wechatApi = new Wechat()
const app = express();

(async()=>{
    await wechatApi.fetchAccessToken();
})();

app.use(reply())

app.listen(3000, function() {
    console.log('running ..........')
})