module.exports = function (id, tagname, errormsg, count, op, attr, selectorname) {
    this.id = id;
    this.tagname = tagname;
    this.errormsg = errormsg;
    this.count = count || 1;
    this.op = op || 'eq';
    this.attr = attr;
    this.selectorname = selectorname;
};
