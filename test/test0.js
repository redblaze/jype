const util = require('util');
var Compile = require('../lib/Compile');
var TypeCheck = require('../lib/TypeCheck');
var validators = require('../examples/validators');

var log = function(o) {
    console.log(util.inspect(o, {showHidden: true, depth: null}));
};

var typeCheck = new TypeCheck({}, {});

log(typeCheck.run("abc", {"type": "String"})); // returns true;
log(typeCheck.run(123, {"type": "String"}));   // returns false;


log(typeCheck.run(123, {"type": "Number"}));
log(typeCheck.run("abc", {"type": "Number"}));

log(typeCheck.run(true, {"type": "Boolean"}));   // returns true;
log(typeCheck.run(false, {"type": "Boolean"}));   // returns true;
log(typeCheck.run("abc", {"type": "Boolean"})); // returns false;
log(typeCheck.run(100, {"type": "Boolean"})); // returns false;