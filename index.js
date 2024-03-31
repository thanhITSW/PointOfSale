const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const session = require('express-session')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

app.use(cookieParser('ptt_nmtt_tnp'));
app.use(session({ cookie: { maxAge: 6000000 } })); // session in 60m = 1h
app.use(flash());

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


app.use('/', require('./routers/Home'))
app.use('/accounts', require('./routers/Account'))
app.use('/products', require('./routers/Product'))
app.use('/carts', require('./routers/Cart'))
app.use('/orders', require('./routers/Order'))
app.use('/customers', require('./routers/Customer'))

app.use((req, res) => {
    res.json({
        code: 1,
        message: `Method ${req.method} not supported with URL ${req.url}`
    })
})

const PORT = process.env.PORT || 3000
const LINK_WEB = process.env.LINK_WEB || 'http://localhost:' + PORT
const {MONGODB_URI, DB_NAME} = process.env
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME
})
.then(() => {
    app.listen(PORT, () => {
        console.log(LINK_WEB)
    })
})
.catch(e => console.log('Can not connect db server: ' + e.message))