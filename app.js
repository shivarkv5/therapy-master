let express = require('express')
const app = express();
let bodyParser = require('body-parser')
let conversion = require('./conversation')
let session = require('express-session')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('./public'))
app.use(session({ secret: 'rachel_bot', cookie: { maxAge: 60000 },  resave: true,saveUninitialized: true}))
app.post('/', (req, res) => {
})
app.post('/gateway1', async (req, res) => {
    // console.log(req.session.id)
    let msg = await conversion.handleMessage({
        uuid: req.session.id,
        phone: '8312220167'
    }, req.body.q)
    let data
    console.log(msg)
    if (msg["data"]||typeof msg==="string") {
        data = {
            components: [{
                name: 'DEFAULT',
                content: typeof msg==="string"?msg:msg.prompt
            }]
        }
        console.log("enter in to first if")
    } else {
        data = {
            components: [{
                name: 'DEFAULT',
                content: msg.prompt
            }, {
                name: 'SUGGESTIONS',
                content: msg.options
            }]
        }
                console.log("enter in to second if")

    }

    res.send(data)
});

let path = require('path')
app.use('/bot', express.static('./web/public'))
app.get('/bot/:phone', (req, res) => {
    res.sendFile(path.join(__dirname, "web", 'public', 'index.html'))
})
let db = require('./db')
app.post('/getUserChat', async(req, res) => {
    let result = await db.getUserChat(req.body.id)
    res.send(result)
})
app.get('/admin',async (req, res) => {
    let result = await db.getHistory()
    let array=[];
    result.forEach(e1 => {
        let tmpres=result.filter(fe => {
            if (e1.user_uuid === fe.user_uuid) {
                return fe
            }
        })
        if (array.find(e => e[0].user_uuid === tmpres[0].user_uuid)===undefined) {
            array.push(tmpres)
        }
    })
    result = array
    res.render('chathistory.ejs', { result })
})
let firebase = require('./firebase')
app.post('/notify',(req,res)=>{
    console.log(req.body)
    firebase.sendNotification(req.body.title,req.body.body);
    res.send("sent")
})

let port= process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server started on port`,port);
});

