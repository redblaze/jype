
var Compile = require('./Compile');
var TypeCheck = require('./TypeCheck');
var merge = require('./Merge');

var jype = {
    Compile: Compile,
    TypeCheck: TypeCheck,
    merge: merge
};

module.exports = jype;
