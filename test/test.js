var TypeCheck = require('../lib/TypeCheck');
var Type = require('../lib/Type');

var $T = new Type();

var $TC = new TypeCheck({typeDefs: $T.getAliases()});

// var res = $TC.typeCheck({year: 2000, month: 2, date: 29}, $T.alias('Date'));
var res = $TC.typeCheck('red_sparc@yahoo.com', $T.alias('Email'));

console.log(res);
