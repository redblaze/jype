var TypeCheck = require('./../lib/TypeCheck');
var $V = require('./validators');

module.exports = {
    Email: {
        // 'type': 'String',
        "type": "Alias",
        "name": "String255",
        'validator': {
            "isEmail": 1
        }
    },

    Integer: {
        'type': 'Number',
        'validator': {
            'isInteger': 1
        }
    },

    Date: {
        'type': 'Object',
        'fields': {
            'year': {'type': 'Alias', 'name': 'Integer'},
            'month': {'type': 'Alias', 'name': 'Integer'},
            'date': {'type': 'Alias', 'name': 'Integer'}
        },
        'validator': {
            'isDateObject': 1
        }
    },

    String255: {
        "type": "String",
        "validator": {
            "size": 255
        }
    }
};
