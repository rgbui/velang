var path = require('path');
var fo = require('../../../app/common/fo.js').fo;
var docsDir = path.join(__dirname, '../docs');
var webDocsDir = path.join(__dirname, '../web/docs');

var contents = require(path.join(__dirname, 'contents.json'));
var menus = [];
contents.forEach(x => {
    var item = { text: x.text, childs: [] };
    x.childs.forEach(y => {
        var mdFilePath = path.join(docsDir, x.text, y.text + '.md');
        item.childs.push(
            {
                text: y.text,
                url: y.url,
                html: convertToHtml(mdFilePath)
            }
        );
    });
    menus.push(item);
});
menus.forEach(x => {
    x.childs.forEach(y => {
        var writeFilePath = path.join(webDocsDir, y.url);
        var html = makeHtml(x, y, menus);
        fo.write(writeFilePath, html);
    });
});
console.log("end ...");

function convertToHtml(mdFilePath) {
    var mdContent = fo.read(mdFilePath);
    var showdown = require('showdown');
    showdown.setFlavor('github');
    var converter = new showdown.Converter();
    return converter.makeHtml(mdContent);
}
function makeHtml(x, y, menus) {
    var makeMenus = (x, y, menus) => {
        var eles = [];
        menus.forEach(m => {
            var e = `
           <li class="panel">
                <a>${m.text}</a>
                <ul>
                ${
                m.childs.map(p => {
                    var active = y.url == p.url ? `class="active"` : "";
                    return `<li class="item"><a href="/${p.url}" ${active}>${p.text}</a></li>`
                }).join("\n")
                }
                </ul>
           </li>
           `;
            eles.push(e);
        });
        return eles.join('\n');
    };
    var menusHtml = `
    <ul>
        ${makeMenus(x, y, menus)}
    </ul>
    `;
    var template = fo.read(path.join(__dirname, 'template.html'));
    template = template.replace(/{\s*{\s*title\s*}\s*}/g, y.text)
    template = template.replace(/{\s*{\s*menus\s*}\s*}/g, menusHtml);
    template = template.replace(/{\s*{\s*content\s*}\s*}/g, y.html);
    return template;
}


