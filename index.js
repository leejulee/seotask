const seorule = require('./lib/seorule')
const { seoHelper } = require('./lib/seohelper')

var shelper = new seoHelper();
// console.log(shelper._rules)
//shelper.setRulesForIds(['title', 'meta_des', 'a'])

//shelper.runCheckRulesToConsole();
shelper.runCheckRulesToDest();

module.exports = {
    seorule: seorule,
    seoHelper: seoHelper
}