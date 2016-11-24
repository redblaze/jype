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
            if ($U.isArray(v) || $U.isString(v)) {
                return v.length < limit;
            }

            if ($U.isObject(v)) {
                return $U.keys(v).length < limit;
            }

            this._typeError = true;
            return false;
        },

        errorMessage: function(v, limit) {
            if (this._typeError) {
                return 'Validator "size" can only be used on arrays or objects.'
            } else {
                return 'Length is beyond limit "' + limit + '"';
            }
        }
    }),

    "singleton": Class({
        check: function(v) {
            if (!$U.isObject(v)) {
                this._errorMessage = 'Validator "singleton" can only applied to objects.';
                return false;
            }

            if ($U.keys(v).length != 1) {
                this._errorMessage = 'Object is not a singleton.';
                return false;
            }

            return true;
        },

        errorMessage: function() {
            return this._errorMessage;
        }
    }),

    "literal": Class({
        check: function(v, cfg) {
            return v == cfg;
        },

        errorMessage: function(v, cfg) {
            return '"' + v + ' is not "' + cfg + '".';
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
            "element": {"type": "String"}
        },

        check: function(v, list) {
            return $U.contains(list, v);
        },

        errorMessage: function(v, list) {
            return 'Value: "' + v + '" is not found in list: "' + list + '".';
        }
    }),

    'noUndefinedAlias': Class({
        check: function(v) {
            return true;
        }
    }),

    'noAliasCycle': Class({
        check: function(v) {
            return true;
        }
    })
};


module.exports = validators;
