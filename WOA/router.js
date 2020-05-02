var express = require('express')
var DcUser = require('./models/users')
var MD5 = require('blueimp-md5')
var fs = require('fs')
var path = require('path')
var md = require('markdown-it')()
var formidable = require('formidable')
const Random = require("random-js").Random;
var path = require('path')
var request = require('request')
const reply=require('./reply')


const random = new Random();


var File = require('./fileOpt')

var router = express.Router()

router.get('/', function(req, res) {
    req.session.user = null
    res.render('login_register.html')
})

router.get('/index', function(req, res,) {
    var user = req.session.user
    if (user !== undefined) {
        File.readF(user.idS, 'preNotes.json', function(err, preNotes) {
            if (err) {
                return res.send('内部错误1，稍后在试')

            }
            res.render('index.html', {
                user: user,
                files: preNotes
            })
        })
    } else {
        res.render('index.html', {
            user: user,
        })
    }
})

router.get('/forgot', function(req, res) {
    res.render('forgot.html')
})

router.get('/about', function(req, res) {
    res.render('about.html', {
        user: req.session.user
    })
})

router.get('/writeNote', function(req, res) {
    var user = req.session.user
    req.session.randomN = random.integer(100000, 99999999)
    res.render('writeNote.html', {
        user: user
    })
})

router.get('/individualPortfolio', function(req, res) {
    var user = req.session.user
    if (user !== undefined) {
        File.readF(user.idS, 'preNotes.json', function(err, preNotes) {
            if (err) {
                return res.send('内部错误1，稍后在试')
            }
            res.render('portfolio.html', {
                user: user,
                files: preNotes
            })
        })
    } else {
        res.render('portfolio.html', {
            user: user,
        })
    }
})

router.get('/allPortfolio', function(req, res) {
    var user = req.session.user
    if (user !== undefined) {
        File.readFA('preNotes.json', function(err, preNoteAll) {
            if (err) {
                return res.send('内部错误1，稍后在试')
            }
            res.render('portfolio.html', {
                user: user,
                files: preNoteAll
            })
        })
    } else {
        res.render('portfolio.html', {
            user: user,
        })
    }
})

router.post('/forgot', function(req, res) {
    //console.log(req.body)
    return res.status(200).json({
        erro_code: 0,
        erro_message: 'System update......'
    })
})

router.post('/register', function(req, res) {
    var body = req.body
    DcUser.findOne({
        $or: [{ username: body.username }, { email: body.email }]
    }, function(err, user) {
        if (err) {
            return res.status(500).json({
                erro_code: 500,
                erro_message: 'too many people do this,please wait a moment......'
            })
        }
        if (user) {
            return res.status(200).json({
                erro_code: 1,
                erro_message: 'username or email was existed.'
            })
        }
        //console.log(body)
        body.password = MD5(MD5(body.password))
        var user = {
            idS: MD5(body.email).replace(/[0-4]+[a-k]/g, ""),
            username: body.username,
            email: body.email,
            password: body.password
        }
        new DcUser(user).save(function(err, data) {
            if (err) {
                console.log('erro_message')
                return res.status(500).json({
                    erro_code: 500,
                    erro_message: 'too many people do this,please wait a moment.'
                })
            }
            return res.status(200).json({
                erro_code: 0,
                erro_message: 'sign up success.'
            })
        })
    })

})

router.post('/login', function(req, res) {
    var body = req.body
    DcUser.findOne({
        email: body.email,
        password: MD5(MD5(body.password))
    }, function(err, user) {
        if (err) {
            return res.status(500).json({
                erro_code: 500,
                erro_message: 'too many people do this,please wait a moment.'
            })
        }
        if (!user) {
            return res.status(200).json({
                erro_code: 1,
                erro_message: 'email and password is invalied'
            })
        }
        req.session.user = user
        return res.status(200).json({
            erro_code: 0,
            erro_message: 'sign in success.'
        })
    })
})

router.get('/portifolio-page', function(req, res) {
    var idR = req.query.idR
    var user = req.session.user
    if (user === undefined) {
        return res.redirect('/')
    }
    File.readR(idR, 'rNotes.json', function(err, rNote) {
        if (err) {
            console.log(err)
            return res.send('内部错误1(读写文件），稍后在试')
        }
        if (rNote === undefined) {
            return res.send('内部错误2（文件不存在），稍后在试')
        }
        fs.readFile('./markdown/' + rNote.md, 'utf8', function(err, markdown) {
            if (err) {
                return res.send('内部错误3（读写文件），稍后在试')
            }
            markdown = md.render(markdown).replace(/&gt;/g, ">")
            markdown = markdown.replace(/&lt;/g, "<")
            markdown = markdown.replace(/language-mermaid/g, "mermaid")
            markdown = markdown.replace(/&quot;/g, '"')
            markdown = markdown.replace(/src="/g, 'src="/public/img/')
            fs.readFile('./views/portfolio-page00.html', 'utf8', function(err, html) {
                if (err) {
                    return res.send('内部错误4（读写文件），稍后在试')
                }
                html = html.replace('{{body}}', markdown)
                html = html.replace('{{title}}', rNote.title)
                html = html.replace('{{user.username}}', user.username)
                if (user) {
                    res.send(html)
                } else {
                    res.redirect('/')
                }

            })
        })
    })



})

router.post('/preview', function(req, res) {
    var title = req.body.title
    var note = req.body.note

    note = md.render(note).replace(/&gt;/g, ">")
    note = note.replace(/&lt;/g, "<")
    note = note.replace(/language-mermaid/g, "mermaid")
    note = note.replace(/&quot;/g, '"')
    note = note.replace(/src="/g, 'src="/public/temporaryImg/')
    //console.log(note)
    return res.status(200).json({
        note: note,
        title: title
    })
})

router.post('/fileUpload', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Content-Type', 'application/json')
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8'; // 编码
    form.keepExtensions = true; // 保留扩展名
    form.maxFieldsSize = 2 * 1024 * 1024; // 文件大小
    form.uploadDir = __dirname + '/public/temporaryImg/' // 存储路径
    form.parse(req, function(err, fileds, files) { // 解析 formData数据
        if (err) {
            return res.status(500).json({
                erro_code: 500,
                erro_message: 'erro internal'
            })
        }

        var imgs = new Array()
        var i = 0
        for (var item in files) {
            imgs[i] = files[item]
            i++
        }

        var imgsB = new Array()
        var imgsA = new Array()

        var randomN = req.session.randomN
        for (var j = 0; j < imgs.length; j++) {
            var types = imgs[j].name.split('.')
            var suffix = types[types.length - 1]
            var name = randomN + '_' + j + '.' + suffix
            imgsB[j] = imgs[j].name
            imgsA[j] = name
            fs.renameSync(imgs[j].path, form.uploadDir + name)
        }

        req.session.imgsD = imgsA
        return res.status(200).json({
            erro_code: 0,
            erro_message: 'success',
            imgB: imgsB,
            imgA: imgsA
        })
    })
})

router.post('/noteUpload', function(req, res) {
    var user = req.session.user
    var title = req.body.title
    var note = req.body.note
    var idS = req.body.idS
    var imgsD = req.session.imgsD
    if (imgsD === undefined) {
        imgsD = new Array()
        imgsD[0] = 'default.jpg'
    }
    var nameMd = random.integer(100000, 99999999).toString() + '.md'
    var idR = random.integer(100000, 99999999).toString()
    req.session.idR = idR
    fs.writeFile(path.join(__dirname, './markdown/' + nameMd), note, 'utf8', function(err) {
        if (err) {
            return res.status(500).json({
                erro_code: 500,
                erro_message: 'errro'
            })
        }
        File.saveR('rNotes.json', req.body, nameMd, idR, imgsD, function(err) {
            if (err) {
                return res.status(500).json({
                    erro_code: 500,
                    erro_message: 'errro'
                })
            }
            File.saveF('preNotes.json', req.body, idR, imgsD, function(err) {
                if (err) {
                    return res.status(500).json({
                        erro_code: 500,
                        erro_message: 'errro'
                    })
                }
                if (imgsD[0] !== 'default.jpg') {
                    //提交时临时图片目录转存为正式的目录
                    for (var i = 0; i < imgsD.length; i++) {
                        fs.copyFileSync(path.join(__dirname, './public/temporaryImg/' + imgsD[i]), path.join(__dirname, './public/img/' + imgsD[i]))
                    }

                    //删除临时图片目录中的图片
                    for (var i = 0; i < imgsD.length; i++) {
                        fs.unlinkSync(path.join(__dirname, './public/temporaryImg/' + imgsD[i]))
                    }
                }

                return res.status(200).json({
                    erro_message: 'submit successful',
                    erro_code: 0,
                    user: user
                })
            })
        })
    })
})

router.use(reply())
/*router.post('/copyImg', function(req, res) {
    var body = req.body

    console.log(body)
})
*/
module.exports = router
