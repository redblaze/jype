var Class = require('better-js-class');

var TypeCheck = require('./TypeCheck');

var Type = Class({
    _init: function() {
        var me = this;

        this._aliases = {};

        this.define('Email', {
                'type': 'String',
                'validator': function (v) {
                    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
                    return TypeCheck.validate({
                        guard: re.test(v),
                        message: v + ' is not a valid email address.'
                    });
                }
            });

        this.define('Integer', {
            'type': 'Number',
            'validator': function(v) {
                return TypeCheck.validate({
                    guard: Math.floor(v) == v,
                    message: v + ' is not an integer.'
                });
            }
        });

        this.define('Date', {
            'type': 'Object',
            'fields': {
                'year': this.alias('Integer'),
                'month': this.alias('Integer'),
                'date': this.alias('Integer')
            },
            'validator': function(v) {
                return TypeCheck.validate({
                    guard: me._validateDate(v['year'], v['month'] - 1, v['date']),
                    message: v + ' is not a valid date.'
                });
            }
        });
    },

    string: {
        'type': 'String'
    },

    number: {
        'type': 'Number'
    },

    date: {
        'type': 'Date'
    },

    boolean: {
        'type': 'Boolean'
    },

    array: function(element, validator) {
        var t = {
            'type': 'Array',
            'element': element
        };

        if (validator) {
            t['validator'] = validator;
        }

        return t;
    },

    object: function(fields, validator) {
        var t = {
            'type': 'Object',
            'fields': fields
        };

        if (validator) {
            t['validator'] = validator;
        }

        return t;
    },

    union: function(variants, validator) {
        var t = {
            'type': 'Union',
            'variants': variants
        };

        if (validator) {
            t['validator'] = validator;
        }

        return t;
    },

    alias: function(name, validator) {
        var t = {
            'type': 'Alias',
            'alias': name
        };

        if (validator) {
            t['validator'] = validator;
        }

        return t;
    },

    _validateDate: function(year, month, date) {
        var d = new Date(year, month, date);

        return d.getFullYear() == year
            && d.getMonth() == month
            && d.getDate() == date;
    },

    define: function(name, def) {
        this._aliases[name] = def;
    },

    getAliases: function() {
        return this._aliases;
    }
});

module.exports = Type;
