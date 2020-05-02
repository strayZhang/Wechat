const { parseString } = require('xml2js')
const { readFile, writeFile } = require('fs')
const{resolve}=require('path')
module.exports = {
    getUserDataAsync(req) {
        let xmlData = ''
        return new Promise((resolve, reject) => {
            req
                .on('data', data => {
                    xmlData += data
                })
                .on('end', () => {
                    resolve(xmlData)
                })
        })

    },
    parseXMLAsync(xmlData) {
        return new Promise((resolve, reject) => {
            parseString(xmlData, { trim: true }, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject('parseXMLAsync方法出错了' + err)
                }
            })
        })
    },
    formatMassageAsync(jsData) {
        let message = {}
        jsData = jsData.xml
        if (typeof jsData === 'object') {
            for (let key in jsData) {
                let value = jsData[key]
                if (Array.isArray(value) && value.length > 0) {
                    message[key] = value[0]
                }
            }
        }
        return message
    },
    writeFileAsync(data,fileName){
    	data = JSON.stringify(data)
    	const filePath=resolve(__dirname,fileName)
    	return new Promise((resolve, reject) => {
            writeFile(filePath,  data, err => {
                if (!err) {
                    resolve('保存成功')
                } else {
                    reject('writeFileAsync方法出问题了' + err)
                }
            })
        })
    },
    readFileAsync(fileName){
    	const filePath=resolve(__dirname,fileName)
    	return new Promise((resolve, reject) => {
            readFile(filePath, 'utf8', (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject('readFileAsync方法出问题了' + err)
                }
            })
        })
    }
}