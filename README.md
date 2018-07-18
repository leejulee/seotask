# seotask

- use 

``` js
var seotask = require('seotask')
var { seorule, seoHelper } = seotask 
```

- example
    - init 
    ```
    var shelper = new seoHelper();
    ```
    - init input path & output 
    ```
    var shelper = new seoHelper('./templates/t001.html', './dist2');
    ```    

    - add rule (./lib/seorule.js)
    ``` js
    var cs = new seorule({
        id: "meta_robots", tagname: "meta", errormsg: "This html without <mata> robots tag", attr: "name", selectorname: "robots"
    })    

    shelper.addRules(cs)
    ```

    - select rules for ids (./lib/rules.js)
    ``` js
    /* default ids=> title、h1、strong_max、meta_des、meta_keywords、img、a*/

    shelper.setRulesForIds(['title', 'meta_des', 'a', 'meta_robots'])    
    ```

    - read file & write output
    ``` js
    var shelper = new seoHelper();

    var sinfo = shelper.createReadFile()

    sinfo.writeConsole();

    sinfo.writeFile();

    var ws = sinfo.writeStream();

    process.stdin.pipe(ws);

    process.stdin.unpipe(ws);

    ```

    - read Stream & write output

    ``` js
    var sinfoStream = shelper.createReadStream()

    sinfoStream.writeConsole();

    sinfoStream.writeFile();

    var wsStream = sinfoStream.writeStream();

    process.stdin.pipe(wsStream);

    process.stdin.unpipe(wsStream);
    ```
