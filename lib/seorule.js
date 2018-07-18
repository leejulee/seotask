module.exports = function (options) {
    this.id = options.id;
    this.tagname = options.tagname;
    this.errormsg = options.errormsg || '';
    this.count = options.count || 1;
    this.op = options.op || 'eq';
    this.attr = options.attr;
    this.selectorname = options.selectorname;
};
