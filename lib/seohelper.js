const fs = require('fs')
const cheerio = require('cheerio')
const seorule = require('./seorule')
const { Readable, Stream } = require('stream');

var sTitle = new seorule('title', 'title', 'This HTML without <title> tag');
var sH1 = new seorule('h1', 'h1', 'This HTML have more than one <h1> tag');
var sStrong = new seorule('strong_max', 'strong', 'This HTML have more than 15 <strong> tag', 15, 'gt');
var sMetaDes = new seorule('meta_des', 'meta', 'This HTML without <meta> description tag', attr = 'name', selectorname = 'description');
var sMetaKey = new seorule('meta_keywords', 'meta', 'This HTML without <meta> keywords tag', attr = 'name', selectorname = 'keywords');
var sImg = new seorule('img', 'img', 'There are ${sum} <img> tag without alt arrtibute', 0, 'gt', attr = 'alt');
var sA = new seorule('a', 'a', 'There are ${sum} <a> tag without rel arrtibute', 0, 'gt', attr = 'rel');

var default_rules = [sTitle, sH1, sStrong, sMetaDes, sMetaKey, sImg, sA]

function checkTag(item, source, isPath) {

    const maxcount = item.count
    var sum = 0;
    const op = item.op

    //todo check source
    var htmlData = source;

    if (isPath) {
        htmlData = fs.readFileSync(source)
    }

    const $ = cheerio.load(htmlData)

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

class seoInfo extends seoHelperbase {

    constructor(name, type, inputpath, distfile, fileName) {
        super()
        this.name = name;
        this.type = type; //file or stream
        this.inputpath = inputpath;
        this.distfile = distfile;
        this.fileName = fileName;
    }

    writeConsole() { }

    writeFile() { }

    writeStream() {
        var writable = new Stream.Writable({
            write: function (chunk, encoding, next) {
                console.log(chunk.toString());
                next()
            }
        });

        return writable;
    }
}

class seoFileInfo extends seoInfo {

    writeConsole() {
        this._rules.forEach(item => {
            var message = checkTag(item, this.inputpath, true)
            if (message) {
                console.log(message);
            }
        }, this)
    }

    writeFile() {
        var messages = '';

        this._rules.forEach(item => {
            var message = checkTag(item, this.inputpath, true)
            if (message) {
                messages += `${message}\n`;
            }
        }, this)

        writeFileToDest(this.distfile, this.fileName, messages);
    }

    writeStream() {
        var writable = super.writeStream();

        this._rules.forEach(item => {
            var message = checkTag(item, this.inputpath, true)
            if (message) {
                writable.write(`${message}`)
            }
        }, this)

        writable.end();

        return writable;
    }
}

class seoSreamInfo extends seoInfo {

    constructor(name, type, inputpath, distfile, fileName) {
        super(name, type, inputpath, distfile, fileName)

        this.data = '';

        this.readerStream = fs.createReadStream(this.inputpath);
        this.readerStream.setEncoding('UTF8');
        this.readerStream.on('data', function (chunk) {
            this.data += chunk;
        }, this);

        this.readerStream.on('error', function (err) {
            console.log(err.stack);
        });
    }

    writeConsole() {
        this.readerStream.on('end', (function () {
            this._rules.forEach(item => {
                var message = checkTag(item, this.data)
                if (message) {
                    console.log(message);
                }
            }, this)
            // console.log(this.data);
        }).bind(this));
    }

    writeFile() {
        this.readerStream.on('end', (function () {
            var messages = ''

            this._rules.forEach(item => {
                var message = checkTag(item, this.data)
                if (message) {
                    messages += `${message}\n`;
                }
            }, this)

            writeFileToDest(this.distfile, this.fileName, messages);
            // console.log(this.data);
        }).bind(this));
    }

    writeStream() {
        var writable = super.writeStream();

        this.readerStream.on('end', () => {
            this._rules.forEach(item => {
                var message = checkTag(item, this.data)
                if (message) {
                    writable.write(`${message}`)
                }
            }, this)

            writable.end();
        }, this);

        return writable;
    }
}

class seoHelper extends seoHelperbase {

    constructor(inputfile, outputDistPath, fileName) {
        super();
        this.inputpath = inputfile || './templates/t002.html';
        this.distfile = outputDistPath || './dist';
        this.fileName = fileName || 'seoresult.txt';
        // console.log(this.inputpath);
        // console.log(this.distfile);
    }

    createReadStream() {
        this.inputpath = './templates/t003.html';
        return new seoSreamInfo('createReadStream', '', this.inputpath, this.distfile, this.fileName)
    }

    createReadFile() {
        return new seoFileInfo('createReadFile', '', this.inputpath, this.distfile, this.fileName)
    }

    // runCheckRulesToConsole() {
    //     this._rules.forEach(item => {
    //         var message = checkTag(item, this.inputpath, true)
    //         if (message) {
    //             console.log(message);
    //         }
    //     }, this)
    // }

    // runCheckRulesToDest() {
    //     var messages = '';

    //     this._rules.forEach(item => {
    //         var message = checkTag(item, this.inputpath, true)
    //         if (message) {
    //             messages += `${message}\n`;
    //         }
    //     }, this)

    //     writeFileToDest(this.distfile, this.fileName, messages);
    // }

    // runCheckRulesForReadStream() {
    //     var data = '';
    //     var readerStream = fs.createReadStream('./templates/t003.html');
    //     readerStream.setEncoding('UTF8');
    //     readerStream.on('data', function (chunk) {
    //         data += chunk;
    //     });
    //     readerStream.on('end', function () {
    //         console.log(data);
    //     });

    //     readerStream.on('error', function (err) {
    //         console.log(err.stack);
    //     });
    // }

    // readstream2Console() {
    //     var data = '';

    //     const inStream = new Readable({
    //         read(size) { }
    //     });

    //     inStream.on('data', function (chunk) {
    //         data += chunk;
    //     });

    //     inStream.on('end', () => {
    //         console.log('====');
    //         //console.log(data);
    //         this._rules.forEach(item => {
    //             var message = checkTag(item, data)
    //             if (message) {
    //                 console.log(message);
    //             }
    //         }, this)
    //     }, this)

    //     return inStream
    // }

    // readstream2File() {
    //     var messages = '';

    //     var data = '';

    //     const inStream = new Readable({
    //         read(size) { }
    //     });

    //     inStream.on('data', function (chunk) {
    //         data += chunk;
    //     });

    //     inStream.on('end', () => {
    //         console.log('====');
    //         //console.log(data);
    //         this._rules.forEach(item => {
    //             var message = checkTag(item, data)
    //             if (message) {
    //                 messages += `${message}\n`;
    //             }
    //         }, this)

    //         writeFileToDest(this.distfile, this.fileName, messages);
    //     }, this)


    //     return inStream
    // }
}

module.exports = {
    seoHelper: seoHelper
}