const fs = require('fs')
const cheerio = require('cheerio')
const seorule = require('./seorule')

var sTitle = new seorule('title', 'title', 'This HTML without <title> tag');
var sH1 = new seorule('h1', 'h1', 'This HTML have more than one <h1> tag');
var sStrong = new seorule('strong_max', 'strong', 'This HTML have more than 15 <strong> tag', 15, 'gt');
var sMetaDes = new seorule('meta_des', 'meta', 'This HTML without <meta> description tag', attr = 'name', selectorname = 'description');
var sMetaKey = new seorule('meta_keywords', 'meta', 'This HTML without <meta> keywords tag', attr = 'name', selectorname = 'keywords');
var sImg = new seorule('img', 'img', 'There are ${sum} <img> tag without alt arrtibute', 0, 'gt', attr = 'alt');
var sA = new seorule('a', 'a', 'There are ${sum} <a> tag without rel arrtibute', 0, 'gt', attr = 'rel');

var default_rules = [sTitle, sH1, sStrong, sMetaDes, sMetaKey, sImg, sA]

function checkTag(item, filepath) {
    const maxcount = item.count
    var sum = 0;
    const op = item.op

    //todo check path
    const $ = cheerio.load(fs.readFileSync(filepath))

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

    return (result) ? item.errormsg.replace('${sum}', sum) : "";
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

class seoHelperbase {

    constructor() {
        this._rules = default_rules;
    }

    setRulesForIds(ids) {
        if (ids) {
            var tempRules = [];
            this._rules.forEach(function (seorule) {
                if (ids.indexOf(seorule.id) != -1) {
                    tempRules.push(seorule);
                }
            }, this);

            this.setRules(tempRules);
        }
    }

    addRules(seorule) {
        //todo check rule
        if (seorule) {
            this._rules.push(seorule);
        }
    }

    setRules(rules) {
        //todo check rules
        if (rules) {
            this._rules = rules;
        }
    }

    getRules() {
        return this._rules;
    }
}

class seoHelper extends seoHelperbase {

    constructor(inputfile, outputDistPath, fileName) {
        super();
        this.inputpath = inputfile || './templates/t002.html';
        this.distfile = outputDistPath || './dist';
        this.fileName = fileName || 'seoresult.txt';
        console.log(this.inputpath);
        console.log(this.distfile);
    }

    runCheckRulesToConsole() {        
        this._rules.forEach(item => {
            var message = checkTag(item, this.inputpath)
            if (message) {
                console.log(message);
            }
        }, this)
    }

    runCheckRulesToDest() {
        var messages = '';

        this._rules.forEach(item => {
            var message = checkTag(item, this.inputpath)
            if (message) {
                messages += `${message}\n`;
            }
        }, this)

        function writeFileToDest(distfile, file, info) {

            if (!fs.existsSync(distfile)) {
                fs.mkdirSync(distfile);
            }

            const path = `${distfile}/${file}`;

            fs.writeFile(path, info, function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            })
        }

        writeFileToDest(this.distfile, this.fileName, messages);
    }

    runCheckRulesToStream() {
        //todo
    }
}

module.exports = {
    seoHelper: seoHelper
}