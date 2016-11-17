var core = require('../examples/types');
var merge = require('../lib/Merge');

var scope = {
    "Main": {type: "Alias", "alias": "Employees"},

    /*
    "Core": {
        "type": "Package",
        "package": core
    },
    */

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

merge(scope, {"Core": {"type": "Package", "package": core}});
merge(scope, {"Core": {"type": "Package", "package": {
    "Foobar": {"type": "String"}
}}});

module.exports = scope;