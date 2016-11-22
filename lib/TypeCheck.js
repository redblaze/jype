var $U = require('underscore');
var ScopeStack = require('./Scope');

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

    var _validate = function(cfg) {
        if (cfg['guard']) {
            return ok();
        } else {
            return validatorError(cfg['message']);
        }
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
        }
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


    var cls = function(cfg) {
        this._typeDefs = cfg['typeDefs'];
        this._validators = cfg['validators'];
    };

    cls.prototype = {
        run: function(value, type) {
            return this.typeCheck(value, type, ScopeStack.getRootScopeStack(this._typeDefs));
        },

        /*
        typeCheck: function(value, type, scopeStack) {
            var me = this;

            if (!type) {
                return ok();
            }

            var nullable = type['nullable'];

            if (nullable) {
                if (value == null) {
                    return ok();
                } else {
                    return me._typeCheck(value, type);
                }
            } else {
                if (value == null) {
                    return simpleError(cls.EXCEPTION.MANDATORY_INPUT_IS_NULL_ERROR);
                } else {
                    return me._typeCheck(value, type, scopeStack);
                }
            }
        },
        */


        typeCheck: function(value, type, scopeStack) {
            return this._typeCheck(value, type, scopeStack);
        },

        _typeCheck: function(value, type, scopeStack) {
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
                    /*
                case 'Union':
                    if (!$U.isObject(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_UNION);
                    } else {
                        var variants = type['variants'];
                        var variantError = {};

                        for (var variantName in variants) {
                            var variantType = variants[variantName]
                            if (value[variantName] != null) {
                                var variantTypeCheckResult = me.typeCheck(value[variantName], variantType, scopeStack);
                                if (variantTypeCheckResult.status == 'ok') {
                                    return validate(validator, value);
                                } else {
                                    variantError[variantName] = variantTypeCheckResult.error;
                                    return unionVariantError(variantError);
                                }
                            }
                        }
                        // return simpleError(cls.EXCEPTION.UNION_VARIANT_NOT_FOUND_ERROR);
                        return unionVariantNotFoundError($U.keys(value)[0]);
                    }
                    */

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
            UNDEFINED_FIELD_NAME: 'undefined_field_name',
            UNION_VARIANT_ERROR: 'union_variant_error',
            UNION_VARIANT_NOT_FOUND_ERROR: 'union_variant_not_found_error',
            ARRAY_ELEMENT_ERROR: 'array_element_error',
            HASH_ELEMENT_ERROR: 'hash_element_error',
            LITERAL_NOT_MATCH: 'literal_not_match',
            /* validate */
            VALIDATOR_ERROR: 'validator_error'
        },
        ok: ok,
        validatorError: validatorError,
        validate: _validate
    });

    return cls;
}();
