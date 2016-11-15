const util = require('util');
var TypeCheck = require('../lib/TypeCheck');
var validators = require('../lib/validators');


var scope = require('./testScope1');
var value = require('./testValue1');

var TC = new TypeCheck({
    typeDefs: scope,
    validators: validators
});

var type = {"type": "Alias", "alias": "Main"};

var res = TC.run(value, type);


console.log(util.inspect(res, {showHidden: true, depth: null}));
