require('../../../../../App/app/common/array.js');
require('../../../../../App/app/common/string.js');

var path = require('path');
var fo = require('../../../../../App/app/common/fo.js').fo;
var RazorTemplate = require('../../../../../App/comp/resolver/razor/razor.template').RazorTemplate;
var showdown = require('showdown');
showdown.setFlavor('github');
var converter = new showdown.Converter();
var async = require('async');
var less = require('less');
var tasks = [];
tasks.push(function (next) {
    var lessDir = path.join(__dirname, "../template")
    less.render(fo.read(path.join(lessDir, "styles.less")), {
        filename: path.join(lessDir, "styles.less"),
        compress: true
    }).then(function (output) {
        fo.write(path.join(__dirname, "../web/assert/style/style.css"), output.css);
        console.log('...output style.css');
        next();
    },
        function (error) {
            console.log(error);
            console.log('...output style.css error');
            next();
        });
});
tasks.push(function (next) {
    var ts = fo.getCurrentFiles(path.join(__dirname, "../template"), x => {
        if (x.endsWith('.html')) return true;
    });
    ts.forEach(t => {
        var content = fo.read(t);
        var rt = new RazorTemplate({ caller: this });
        var html = rt.compile(content, {
            include(filePath) {
                var nt = path.join(__dirname, "../template", filePath);
                var gt = new RazorTemplate({ caller: this });
                return gt.compile(fo.read(nt), {
                    url: fo.getName(t)
                });
            }
        });
        fo.write(path.join(__dirname, "../web", fo.getName(t)), html);
    });
    next();
});
var menus = [];
tasks.push(function (next) {
    var ms = fo.getCurrentFolders(path.join(__dirname, "../docs"));
    ms.remove(x => fo.getName(x) == 'image');
    menus = ms.map(x => { return { title: fo.getName(x), childs: [] } });
    menus.forEach(me => {
        var mds = fo.getCurrentFiles(path.join(__dirname, "../docs", me.title));
        me.childs = mds.map(md => {
            var name = fo.getName(md, true);
            return {
                url: `/docs/${me.title}/${name}.html`,
                filePath: md,
                title: name
            }
        })
    });
    next();
});
tasks.push(function (next) {
    var content = fo.read(path.join(__dirname, "../template/parts/doc.html"));
    menus.each(mc => {
        mc.childs.each(me => {
            var rt = new RazorTemplate({ caller: this });
            var html = rt.compile(content,
                {
                    title: me.title,
                    include(filePath) {
                        var nt = path.join(__dirname, "../template", filePath);
                        var gt = new RazorTemplate({ caller: this });
                        return gt.compile(fo.read(nt),
                            {
                                url: me.url
                            });
                    },
                    md() {
                        return converter.makeHtml(fo.read(me.filePath));
                    },
                    menus() {
                        return `<ol>
                     ${menus.map(mb => {
                            return `<li>
                           <a href='javascript:void' ><span>${mb.title}</span></a>
                           <ul>
                              ${mb.childs.map(mg => {
                                return `<li><a ${mg == me ? "class='active'" : ""}  href='${mg.url}' title='${mg.title}'><span>${mg.title}</span></a></li>`
                            }).join("")}
                           </ul>
                         </li>`
                        }).join("")}                     
                     </ol>`
                    }
                });
            fo.write(path.join(__dirname, "../web", me.url.substring(1)), html);
        })
    });
    next();
});
tasks.push(function (next) {
    fo.copyDir(path.join(__dirname, "../docs/image"), path.join(__dirname, "../web/docs/image"));
    next();
});
async.series(tasks);

