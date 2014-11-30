function mount (app) {
    app.router.addRoute('/', function (req, res, next) {
        if (req.user) {
            return res.redirect('/document-package');
        }
        res.render('index.html');
    });
}

module.exports = {
    mount: mount
};
