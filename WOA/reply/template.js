/*
	消息模板
		+ 文本消息
		+ 图片消息
		+ 语音消息
		+ 视频消息
		+ 音乐消息
		+ 图文消息

*/

module.exports=options=>{
	replyMessage=`<xml>
                    <ToUserName><![CDATA[${options.ToUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${options.FromUserName}]]></FromUserName>
                    <CreateTime>${options.CreateTime}</CreateTime>
                    <MsgType><![CDATA[${options.MsgType}]]></MsgType>`;
    if(options.MsgType==='text'){
    	replyMessage+=`<Content><![CDATA[${options.Content}]]></Content>`
    }else if(options.MsgType==='news'){
		replyMessage+=`<ArticleCount>${options.Content.length}</ArticleCount>
		<Articles>`
		options.Content.forEach(item=>{
			replyMessage+=`<item>
			     <Title><![CDATA[${item.title}]]></Title>
			     <Description><![CDATA[${item.description}]]></Description>
			     <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
			     <Url><![CDATA[${item.url}]]></Url>
		    </item>`;
		});
		replyMessage+= '</Articles>'
	}
	replyMessage+='</xml>'
	return replyMessage
}