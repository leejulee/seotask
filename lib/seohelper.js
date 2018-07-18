const fs = require('fs')
const cheerio = require('cheerio')
const seorule = require('./seorule')
const { Readable, Stream } = require('stream');
const { rules } = require('./rules')

var default_rules = rules

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

class seoInfo {

    constructor(name, type, inputpath, distfile, fileName, rules) {
        this.name = name;
        this.type = type; //file or stream
        this.inputpath = inputpath;
        this.distfile = distfile;
        this.fileName = fileName;
        this._rules = rules;
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

    constructor(name, type, inputpath, distfile, fileName, rules) {
        super(name, type, inputpath, distfile, fileName, rules)

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

        if (!fs.existsSync(this.inputpath)) {
            throw `not found '${this.inputpath}'`
        }
    }

    createReadStream() {
        return new seoSreamInfo('createReadStream', '', this.inputpath, this.distfile, this.fileName, this._rules)
    }

    createReadFile() {
        return new seoFileInfo('createReadFile', '', this.inputpath, this.distfile, this.fileName, this._rules)
    }
}

module.exports = {
    seoHelper: seoHelper
}