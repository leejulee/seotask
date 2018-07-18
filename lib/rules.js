const seorule = require('./seorule')

var sTitle = new seorule({
    id: 'title', tagname: 'title', errormsg: 'This HTML without <title> tag'
});
var sH1 = new seorule({
    id: 'h1', tagname: 'h1', errormsg: 'This HTML have more than one <h1> tag'
});
var sStrong = new seorule({
    id: 'strong_max', tagname: 'strong', errormsg: 'This HTML have more than 15 <strong> tag', count: 15, op: 'gt'
});
var sMetaDes = new seorule({
    id: 'meta_des', tagname: 'meta', errormsg: 'This HTML without <meta> description tag', attr: 'name', selectorname: 'description'
});
var sMetaKey = new seorule({
    id: 'meta_keywords', tagname: 'meta', errormsg: 'This HTML without <meta> keywords tag', attr: 'name', selectorname: 'keywords'
});
var sImg = new seorule({
    id: 'img', tagname: 'img', errormsg: 'There are ${sum} <img> tag without alt arrtibute', count: 0, op: 'gt', attr: 'alt'
});
var sA = new seorule({
    id: 'a', tagname: 'a', errormsg: 'There are ${sum} <a> tag without rel arrtibute', count: 0, op: 'gt', attr: 'rel'
});

module.exports = {
    rules: [sTitle, sH1, sStrong, sMetaDes, sMetaKey, sImg, sA]
}