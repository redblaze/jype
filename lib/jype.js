
var Compile = require('./Compile');
var TypeCheck = require('./TypeCheck');
var types = require('../examples/types');
var validators = require('../examples/validators');
var merge = require('./Merge');

var jype = {
    Compile: Compile,
    TypeCheck: TypeCheck,
    types: types,
    validators: validators,
    merge: merge
};

module.exports = jype;
