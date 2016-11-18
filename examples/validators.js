var $U = require('underscore');
var Class = require('better-js-class');

var validators = {
    'isEmail': Class({
        check: function(s) {
            var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
            return re.test(s);
        },

        errorMessage: function(v) {
            return v + ' is not a valid email address.';
        }
    }),

    'isDateObject': Class({
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

    'isInteger': Class({
        check: function(v) {
            return Math.floor(v) == v;
        },

        errorMessage: function(v) {
            return v + ' is not an integer.';
        }
    }),

    'size': Class({
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

    'mandatory': Class({
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

    'inList': Class({
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
