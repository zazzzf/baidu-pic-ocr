const Koa = require('koa')
const app = new Koa()
const axios = require('axios')
const koaBody = require('koa-body')
const router = require('koa-router')()
const path = require('path')
const fs = require('fs')
const qs = require('querystring')
var cors = require('koa2-cors');
var counter = 0

const callsuccess = (data = '', message="success") => {
    return {
        message,
        data,
        status: 200
    }
} 
router.post('/upload', async ctx => {
    const params = {
        grant_type: 'client_credentials',
        client_id: 'your client_id',
        client_secret: 'your client_secret'
    }
    const {data} = await axios.get('https://aip.baidubce.com/oauth/2.0/token', {
        params
    });

    let token = data.access_token
    
    const {file} = ctx.request.files

    let bitmap = fs.readFileSync(`public/uploads/${file.name}`);
    let base64 = new Buffer(bitmap).toString('base64');
    // https://aip.baidubce.com/rest/2.0/ocr/v1/accurate 高精度含位置
    const result = await axios.post(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token=${token}`, 
        qs.stringify({image: base64})
    )
    ctx.body = callsuccess(result.data)
})
app.use(koaBody({
    // 支持文件格式
    multipart: true,
    formidable: {
        // 上传目录
        uploadDir: path.join(__dirname, 'public/uploads'),
        // 保留文件扩展名
        keepExtensions: true,
        onFileBegin: (name, file) => {
            file.path = `public/uploads/${file.name}`
        }
    }
}))
app.use(cors({
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
        allowHeaders: ['Content-Type', 'Authorization', 'Accept','X-Requested-With'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization','X-Requested-With'] //设置获取其他自定义字段
}));
app.use(router.routes())
app.listen(3000, () => {
    console.log('启动成功 /n 端口号：3000')
})