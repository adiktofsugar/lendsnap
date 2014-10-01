var connect = require('connect')
var http = require('http')
var connectRoute = require('connect-route');

var app = connect();

// gzip/deflate outgoing responses
var compression = require('compression')
app.use(compression())

// store session state in browser cookie
var cookieSession = require('cookie-session')
app.use(cookieSession({
    keys: ['secret1', 'secret2'],
    secureProxy: true
}))

// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())


app.use(connectRoute(function (router) {
    require('./route')
        .setRouter(router)
        .start();

}));


http.createServer(app).listen(3000)
