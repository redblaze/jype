const util = require('util');
var Compile = require('../lib/Compile');
var TypeCheck = require('../lib/TypeCheck');
var validators = require('../examples/validators');


// var scope = require('./testScope1');
// var value = require('./testValue1');

var scope = require('../schema/schema.json');
var value = require('../schema/schema.json');

var log = function(o) {
    console.log(util.inspect(o, {showHidden: true, depth: null}));
};


(function() {
    var compile = new Compile({
        scope: scope,
        validators: validators
    });

    var res = compile.compile();

    if (res['status'] == 'error') {
        log(res['error']);
        return;
    } else {
        // log(compile._scope);
        // log(compile._target);
    }
    var TC = new TypeCheck({
        scope: scope,
        validators: validators
    });

    var type = {"type": "Alias", "name": "Root"};

    var res = TC.run(value, type);

    log(res);
})();
