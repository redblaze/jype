var core = require('../examples/types');
var merge = require('../lib/Merge');

var scope = {
    "Main": {"type": "Alias", "name": "Employees"},

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
            "gender": {"type": "Alias", "name": "Gender"},
            "email": {"type": "Alias", "name": "Email", "path": ["Core"]}
        },
        "validator": {
            "mandatory": ["name", "gender"]
        }
    },

    "Gender": {
        "type": "Union",
        "variants": {
            "male": {"type": "Literal", "value": "male"},
            "female": {"type": "Literal", "value": "female"},
            "transgender": {"type": "String", "validator": {"literal": "transgender"}}
        }
    },

    "Employees": {
        "type": "Union",
        "variants": {
            "employees": {
                "type": "Array",
                "element": {"type": "Alias", "name": "Employee"}
            }/*,
            "cycle": {
                "type": "Alias",
                "name": "Employees"
            }
            */
        }
    }
};

merge(scope, {"Core": {"type": "Package", "package": core}});

merge(scope, {"Core": {"type": "Package", "package": {
    "Foobar": {"type": "String"}
}}});

module.exports = scope;