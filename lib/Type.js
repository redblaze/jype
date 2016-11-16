var TypeCheck = require('./TypeCheck');
var $V = require('./validators');

module.exports = {
    Email: {
        // 'type': 'String',
        "type": "Alias",
        "alias": "String255",
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
            'year': {'type': 'Alias', 'alias': 'Integer'},
            'month': {'type': 'Alias', 'alias': 'Integer'},
            'date': {'type': 'Alias', 'alias': 'Integer'}
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
