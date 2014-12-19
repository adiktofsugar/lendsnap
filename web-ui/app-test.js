var connect = require('connect');
var app = connect();


var cookieSession = require('cookie-session');
// store session state in browser cookie
app.use(cookieSession({
    keys: ['secret1', 'secret2'],
    name: "lendsnap",
    domain: ".lendsnap.com",
    httpOnly: false
}));

app.use(function (req, res, next) {
    res.end("hey there!\n");
});
app.listen(3000, function () {
    var Etcd = require('node-etcd');
    var etcd = new Etcd(process.env.ETCD_HOST);

    var setInfo = function () {
        etcd.set("/services/web-ui", JSON.stringify({
            host: process.env.MACHINE_PRIVATE_IP,
            port: 3000
        }), { ttl: 60 }, console.log);
    };
    setInterval(setInfo, 20000);
    setInfo();
});
