

var path = require('path');
var express = require('express');
var fs = require('fs');
process.on("exit", function () {

});
process.on("uncaughtException", function (err) {

});
var app = new express();
var pages = fs.readdirSync(__dirname);
pages.forEach(page => {
    if (page.indexOf('.html') > -1)
    {
        app.use(page, express.static(__dirname + "/" + page));
    }
})
app.use("/docs", express.static(__dirname + '/docs'));
app.use('/favicon.ico', express.static(__dirname + "/favicon.ico"));
app.listen(80, function () {
    console.log("this web site is opended....");
});
app.get('/', (req, res, next) => {
    res.redirect(302, 'index.html');
})

