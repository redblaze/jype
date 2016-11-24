var $U = require('underscore');

var ScopeStack = require('./Scope');
var Compile = require('./Compile');
var merge = require('./Merge');

var jypeSchema = require('../schema/schema.json');

module.exports = function() {
    var simpleError = function(code) {
        return {
            'status': 'error',
            'error': {
                'code': code
            }
        };
    };

    var ok = function() {
        return {
            'status': 'ok'
        };
    };

    var validatorError = function(validatorError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.VALIDATOR_ERROR,
                'validator': validatorError
            }
        };
    };

    var objectFieldError = function(fieldErrors) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.OBJECT_FIELD_ERROR,
                'fields': fieldErrors
            }
        };
    };

    var mandatoryFieldError = function(fieldName) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.MANDATORY_FIELD_ERROR,
                'missingField': fieldName
            }
        };
    };

    var unionVariantNotFoundError = function(variant) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.UNION_VARIANT_NOT_FOUND_ERROR,
                'variant': variant
            }
        }
    };

    var unionVariantError = function(variantError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.UNION_VARIANT_ERROR,
                'variants': variantError
            }
        }
    };

    var arrayElementError = function(i, elementError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.ARRAY_ELEMENT_ERROR,
                'index': i,
                'element': elementError
            }
        }
    };

    var hashElementError = function(key, elementError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.HASH_ELEMENT_ERROR,
                'key': key,
                'element': elementError
            }
        }
    };

    var validatorConfigError = function(error) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.COMPILE_ERROR_INVALID_VALIDATOR_CFG,
                'validatorConfig': error
            }
        };
    };


    var cls = function(cfg) {
        this._scope = cfg['scope'];
        this._validators = cfg['validators'];
        this._compile = new Compile({
            scope: this._scope
        });
    };

    cls.prototype = {
        run: function(value, type) {
            return this.typeCheck(value, type, ScopeStack.getRootScopeStack(this._scope));
        },

        _getValidatorCfg: function() {
            var res = {};

            for (var k in this._validators) {
                var cfg = this._validators[k].prototype['cfg'];
                if (cfg != null) {
                    res[k] = cfg;
                } else {
                    res[k] = {"type": "Void"};
                }
            }

            return res;
        },

        compile: function() {
            var validatorCfg = this._getValidatorCfg();
            var validatorType = {
                "type": "Object",
                "fields": validatorCfg
            };

            var res = this.typeCheck(validatorType, {
                "type": "Alias",
                "name": "Type",
                "path": ["Jype"]
            }, ScopeStack.getRootScopeStack(jypeSchema));

            if (res['status'] == 'error') {
                console.log('validator cfg error');
                return validatorConfigError(res['error']);
            }

            var clonedJypeSchema = $U.clone(jypeSchema);
            clonedJypeSchema['Validator'] = validatorType;

            res = this.typeCheck(this._scope, {
                "type": "Alias",
                "name": "Scope",
                "path": ["Jype"]
            }, ScopeStack.getRootScopeStack(clonedJypeSchema));

            if (res['status'] == 'error') {
                console.log("compile error");
                return res;
            }

            return this._compile.compile();
        },


        typeCheck: function(value, type, scopeStack) {
            var me = this;

            var typeTag = type['type'];
            var validator = type['validator'];

            /*
            var validate = function(validator, value) {
                if (validator) {
                    return validator(value);
                } else {
                    return ok();
                }
            };
            */

            var validate = function(validator, value) {
                if (validator) {
                    for (var validatorName in validator) {
                        var o = new me._validators[validatorName]();
                        var cfg = validator[validatorName];
                        if (!o.check(value, cfg)) {
                            return validatorError(o.errorMessage(value, cfg));
                        }
                    }
                    return ok();
                } else {
                    return ok();
                }
            };

            switch(typeTag) {
                case 'Literal':
                    var literalValue = type['value'];
                    if (value === literalValue) {
                        return validate(validator, value);
                    } else {
                        return simpleError(cls.EXCEPTION.LITERAL_NOT_MATCH);
                    }
                case 'String':
                    if (!$U.isString(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_STRING);
                    } else {
                        return validate(validator, value);
                    }
                case 'Number':
                    value = parseFloat(value);
                    if (($U.isNaN(value)) || (!$U.isNumber(value))) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_NUMBER);
                    } else {
                        return validate(validator, value);
                    }
                case 'Boolean':
                    if (!$U.isBoolean(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_BOOLEAN);
                    } else {
                        return validate(validator, value);
                    }
                case 'Date':
                    if (!$U.isNumber(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_DATE);
                    } else {
                        return validate(validator, new Date(value));
                    }
                case 'Void':
                    return ok();
                case 'Object':
                    if (!$U.isObject(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_AN_OBJECT);
                    } else {
                        var errors = {};
                        var hasError = false;
                        var fields = type['fields'];
                        var mandatory = type['mandatory'];

                        if (mandatory != null) {
                            for (var i = 0; i < mandatory.length; i++) {
                                if (value[mandatory[i]] == null) {
                                    return mandatoryFieldError(mandatory[i]);
                                }
                            }
                        }

                        for (var fieldName in value) {
                            var fieldType = fields[fieldName];
                            if (fieldType == null) {
                                errors[fieldName] = {code: cls.EXCEPTION.UNDEFINED_FIELD_NAME};
                                hasError = true;
                            } else {
                                var fieldTypeCheckResult = me.typeCheck(value[fieldName], fieldType, scopeStack);
                                if (fieldTypeCheckResult.status == 'ok') {

                                } else {
                                    errors[fieldName] = fieldTypeCheckResult.error;
                                    hasError = true;
                                }
                            }
                        }
                        if (hasError) {
                            return objectFieldError(errors);
                        } else {
                            return validate(validator, value);
                        }
                    }
                case 'Union':
                    var variants = type['variants'];
                    var variantError = {};

                    for (var variantName in variants) {
                        var variantType = variants[variantName]
                        var variantTypeCheckResult = me.typeCheck(value, variantType, scopeStack);
                        if (variantTypeCheckResult.status == 'ok') {
                            var validationResult = validate(validator, value);
                            if (validationResult.status == 'ok') {
                                return ok();
                            } else {
                                variantError[variantName] = validationResult.error;
                            }
                        } else {
                            variantError[variantName] = variantTypeCheckResult.error;
                        }
                    }
                    return unionVariantError(variantError);
                case 'Array':
                    if (!$U.isArray(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_AN_ARRAY);
                    } else {
                        var elemType = type['element'];
                        for (var i = 0; i < value.length; i++) {
                            var elementValue = value[i];
                            var elementTypeCheckResult = me.typeCheck(elementValue, elemType, scopeStack);

                            if (elementTypeCheckResult.status == 'error') {
                                return arrayElementError(i, elementTypeCheckResult.error);
                            }
                        }
                        return validate(validator, value);
                    }
                case 'Hash':
                    if (!$U.isObject(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_AN_ARRAY);
                    } else {
                        var elemType = type['element'];
                        for (var k in value) {
                            var elementValue = value[k];
                            var elementTypeCheckResult = me.typeCheck(elementValue, elemType, scopeStack);

                            if (elementTypeCheckResult.status == 'error') {
                                return hashElementError(k, elementTypeCheckResult.error);
                            }
                        }
                        return validate(validator, value);
                    }
                case 'Alias':
                    var res = scopeStack.lookupType(type['name'], type['path'] || []);
                    if (res) {
                        return me.typeCheck(value, res['type'], res['scope']);
                    } else {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_AN_ALIAS);
                    }

                default:
                    throw new Error('unsupported type tag: ' + typeTag);
            }
        }
    };

    $U.extend(cls, {
        EXCEPTION: {
            /* mandatory */
            MANDATORY_INPUT_IS_NULL_ERROR: 'mandatory_input_is_null_error',
            /* type */
            TYPE_ERROR_NOT_A_STRING: 'type_error_not_a_string',
            TYPE_ERROR_NOT_A_NUMBER: 'type_error_not_a_number',
            TYPE_ERROR_NOT_A_BOOLEAN: 'type_error_not_a_boolean',
            TYPE_ERROR_NOT_A_DATE: 'type_error_not_a_date',
            TYPE_ERROR_NOT_A_VOID: 'type_error_not_a_void',
            TYPE_ERROR_NOT_AN_OBJECT: 'type_error_not_an_object',
            TYPE_ERROR_NOT_A_UNION: 'type_error_not_a_union',
            TYPE_ERROR_NOT_AN_ARRAY: 'type_error_not_an_array',
            TYPE_ERROR_NOT_AN_ALIAS: 'type_error_not_an_alias',
            /* structure */
            OBJECT_FIELD_ERROR: 'object_field_error',
            MANDATORY_FIELD_ERROR: 'mandatory_field_error',
            UNDEFINED_FIELD_NAME: 'undefined_field_name',
            UNION_VARIANT_ERROR: 'union_variant_error',
            UNION_VARIANT_NOT_FOUND_ERROR: 'union_variant_not_found_error',
            ARRAY_ELEMENT_ERROR: 'array_element_error',
            HASH_ELEMENT_ERROR: 'hash_element_error',
            LITERAL_NOT_MATCH: 'literal_not_match',
            /* validate */
            VALIDATOR_ERROR: 'validator_error',
            /* compile */
            COMPILE_ERROR_INVALID_VALIDATOR_CFG: 'compile_error_invalid_validator_cfg'
        },
        merge: merge
    });

    return cls;
}();
