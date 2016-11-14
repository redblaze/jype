var TypeCheck = require('./TypeCheck');
var $V = require('./validators');

module.exports = {
    Email: {
        'type': 'String',
        'validator': {
            "isEmai": {}
        }
    },

    Integer: {
        'type': 'Number',
        'validator': {
            'isInteger': {}
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
            'isDateObject': {}
        }
    },

    MandatoryString255: {
        "type": "String",
        "validator": {
            "size": {"limit": 255},
            "mandatory": {}
        }
    }
};
