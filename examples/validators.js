var $U = require('underscore');

var Validator = function(proto) {
    var init = proto['init'];
    delete proto['init'];

    if (proto['check'] == null) {
        throw new Error('A validator must define "check" method.');
    }

    if (proto['errorMessage'] == null) {
        throw new Error('A validator must define "errorMessage" method.');
    }

    var cls = function() {
        if (init) {
            init.apply(this, arguments);
        }
    };

    cls.prototype = proto;

    return cls;
};


var validators = {
    'isEmail': Validator({
        check: function(s) {
            var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
            return re.test(s);
        },

        errorMessage: function(v) {
            return v + ' is not a valid email address.';
        }
    }),

    'isDateObject': Validator({
        check: function(v) {
            var d = new Date(v['year'], v['month'], v['date']);

            return d.getFullYear() == v['year']
                && d.getMonth() == v['month']
                && d.getDate() == v['date'];
        },

        errorMessage: function(v) {
            return v['month'] + '/' + v['date'] + '/' + v['year'] + ' is not a valid date.';
        }
    }),

    'isInteger': Validator({
        check: function(v) {
            return Math.floor(v) == v;
        },

        errorMessage: function(v) {
            return v + ' is not an integer.';
        }
    }),

    'size': Validator({
        cfg: {
            "type": "Number"
        },

        check: function(v, limit) {
            return v.length < limit;
        },

        errorMessage: function(v, limit) {
            return 'Length is beyond limit "' + limit + '"';
        }
    }),

    'mandatory': Validator({
        cfg: {
            "type": "Array",
            "element": {"type": "String"}
        },

        check: function(v, mandatory) {
            for (var i = 0; i < mandatory.length; i++) {
                if (v[mandatory[i]] === null || v[mandatory[i]] === undefined) {
                    this._missingField = mandatory[i];
                    return false;
                }
            }
            return true;
        },

        errorMessage: function(v, mandatory) {
            return '"' + this._missingField + '" is mandatory but missing.';
        }
    }),

    'inList': Validator({
        cfg: {
            "type": "Array",
            "element": "String"
        },

        check: function(v, list) {
            return $U.contains(list, v);
        },

        errorMessage: function(v, list) {
            return 'Value: "' + v + '" is not found in list: "' + list + '".';
        }
    })
};


module.exports = validators;
