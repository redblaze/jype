module.exports = {
    "Main": {type: "Alias", "alias": "Employees"},

    "Employee": {
        "type": "Object",
        "fields": {
            "name": {"type": "String"},
            "gender": {"type": "Alias", "alias": "Gender"}
        },
        "validator": {
            "mandatory": {"mandatory": ["name", "gender"]}
        }
    },

    "Gender": {
        "type": "Union",
        "variants": {
            "male": {"type": "Void"},
            "female": {"type": "Void"}
        }
    },

    "Employees": {
        "type": "Array",
        "element": {"type": "Alias", "alias": "Employee"}
    }
};