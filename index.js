#! /usr/bin/env node

const fs = require('fs')
const cheerio = require('cheerio')

const $ = cheerio.load(fs.readFileSync('templates/t001.html'))

var data = [
    { tagname: 'title', errormsg: 'This HTML without <title> tag' }
    , { tagname: 'h1', errormsg: 'This HTML have more than one <h1> tag' } //沒有1 error
    , { tagname: 'strong', count: 15, op: 'gt', errormsg: 'This HTML have more than 15 <strong> tag' } //超過15 error
    , { tagname: 'meta', attr: 'name', selectorname: 'description', errormsg: 'This HTML without <meta> description tag' }
    , { tagname: 'meta', attr: 'name', selectorname: 'keywords', errormsg: 'This HTML without <meta> keywords tag' }
    , { tagname: 'img', attr: 'alt', count: 0, op: 'gt', errormsg: 'There are ${sum} <img> tag without alt arrtibute' } //沒有alt error or 
    , { tagname: 'a', attr: 'rel', count: 0, op: 'gt', errormsg: 'There are ${sum} <a> tag without rel arrtibute' }
]

data.forEach(item => {
    checkTag(item)
})

function checkTag(item) {
    const maxcount = item.count || 1
    var sum = 0;
    const op = item.op || 'eq'

    $(item.tagname).each(function () {
        if (item.attr == undefined) {
            sum++
        } else {
            if ($(this).attr(item.attr) == item.selectorname) {
                sum++
            }
        }
    })

    const result = operator(op, sum, maxcount)
    if (result) {
        console.log(item.errormsg.replace('${sum}', sum))
    }
}

function operator(op, sum, maxcount) {
    switch (op) {
        case 'gt':
            if (sum > maxcount) {
                return true;
            }
            break;
        case 'eq':
            if (sum < maxcount) {
                return true;
            }
            break;
        default:
            return false;
    }
}
