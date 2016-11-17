var core = require('../lib/Type');

module.exports = {
    "Main": {type: "Alias", "alias": "Employees"},

    "Core": {
        "type": "Package",
        "package": core
    },

    "Employee": {
        "type": "Object",
        "fields": {
            "name": {"type": "String"},
            "gender": {"type": "Alias", "alias": "Gender"},
            "email": {"type": "Alias", "alias": "Email", "path": ["Core"]}
            // "email": {"type": "Alias", "alias": "Email"}

        },
        "validator": {
            "mandatory": ["name", "gender"]
        }
    },

    "Gender": {
        "type": "Union",
        "variants": {
            "male": {"type": "Void"},
            "female": {"type": "Void"},
            "transgender": {"type": "Void"}
        }
    },

    "Employees": {
        "type": "Array",
        "element": {"type": "Alias", "alias": "Employee"}
    }
};