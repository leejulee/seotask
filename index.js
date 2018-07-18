const seorule = require('./lib/seorule')
const { seoHelper } = require('./lib/seohelper')
const fs = require('fs')

var shelper = new seoHelper();
// console.log(shelper._rules)
//shelper.setRulesForIds(['title', 'meta_des', 'a'])

//shelper.runCheckRulesToConsole();
//shelper.runCheckRulesToDest();

//shelper.runCheckRulesForReadStream()

var seoinfo = shelper.createReadStream();
var seoinfo2 = shelper.createReadFile();

// seoinfo.writeConsole()
// seoinfo.writeFile()

// seoinfo2.writeConsole()
// seoinfo2.writeFile()
//seoinfo2.writeStream()

var ws = seoinfo.writeStream()
var ws2 = seoinfo2.writeStream()

process.stdin.pipe(ws);
process.stdin.unpipe(ws);

process.stdin.pipe(ws2);
process.stdin.unpipe(ws2);

module.exports = {
    seorule: seorule,
    seoHelper: seoHelper
}