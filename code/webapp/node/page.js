var nunjucks = require('nunjucks');

nunjucks.configure('templates', {
    autoescape: true
});

var renderPage = function (templatesPath, data) {
    data = data || {};
    data.version = "123";
    return nunjucks.render(templatesPath, data);
};

module.exports = {
    render: renderPage
};
