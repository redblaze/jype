var TypeCheck = require('./TypeCheck');
var $V = require('./validators');

module.exports = {
    Email: {
        'type': 'String',
        'validator': function (v) {
            return TypeCheck.validate({
                guard: $V.validateEmail(v),
                message: v + ' is not a valid email address.'
            });
        }
    },

    Integer: {
        'type': 'Number',
        'validator': function(v) {
            return TypeCheck.validate({
                guard: $V.validateInteger(v),
                message: v + ' is not an integer.'
            });
        }
    },

    Date: {
        'type': 'Object',
        'fields': {
            'year': {'type': 'Alias', 'alias': 'Integer'},
            'month': {'type': 'Alias', 'alias': 'Integer'},
            'date': {'type': 'Alias', 'alias': 'Integer'}
        },
        'validator': function(v) {
            return TypeCheck.validate({
                guard: $V.validateDate(v['year'], v['month'] - 1, v['date']),
                message: v + ' is not a valid date.'
            });
        }
    }
};
