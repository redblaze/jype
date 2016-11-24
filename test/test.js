const util = require('util');
var TypeCheck = require('../lib/TypeCheck');
var validators = require('../examples/validators');


var scope = require('./testScope1');
var value = require('./testValue1');

// var scope = require('../schema/schema.json');
// var value = require('../schema/schema.json');

var log = function(o) {
    console.log(util.inspect(o, {showHidden: true, depth: null}));
};


(function() {
    var typeCheck = new TypeCheck({
        scope: scope,
        validators: validators
    });

    var res = typeCheck.compile();

    if (res['status'] == 'error') {
        log(res['error']);
        return;
    } else {
        // log(compile._scope);
        // log(typeCheck._compile._target);
    }

    var type = {"type": "Alias", "name": "Main"};

    var res = typeCheck.run(value, type);

    log(res);
})();
