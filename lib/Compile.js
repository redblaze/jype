var $U = require('underscore');
var ScopeStack = require('./Scope');

var ok = function(data) {
    var res = {
        'status': 'ok'
    };
    if (data) {
        res['data'] = data;
    }
    return res;
};

var packageError = function(name, error) {
    return {
        'status': 'error',
        'error': {
            'code': cls.EXCEPTION.PACKAGE_ERROR,
            'packageName': name,
            'package': error
        }
    }
};

var typeError = function(name, error) {
    return {
        'status': 'error',
        'error': {
            'code': cls.EXCEPTION.TYPE_ERROR,
            'typeName': name,
            'type': error
        }
    }
};

var objectError = function(errors) {
    return {
        'status': 'error',
        'error': {
            'code': cls.EXCEPTION.OBJECT_ERROR,
            'fields': errors
        }
    }
};

var unionError = function(errors) {
    return {
        'status': 'error',
        'error': {
            'code': cls.EXCEPTION.UNION_ERROR,
            'variants': errors
        }
    }
};

var arrayError = function(error) {
    return {
        'status': 'error',
        'error': {
            'code': cls.EXCEPTION.ARRAY_ERROR,
            'element': error
        }
    }
};

var aliasError = function(e) {
    return {
        'status': 'error',
        'error': {
            code: cls.EXCEPTION.ALIAS_ERROR,
            message: e.message
        }
    }
};

var typeTagError = function(name) {
    return {
        'status': 'error',
        'error': {
            code: cls.EXCEPTION.TYPE_TAG_ERROR,
            typeTag: name
        }
    };
};

var validatorError = function(error) {
    return {
        'status': 'error',
        'error': {
            code: cls.EXCEPTION.VALIDATOR_ERROR,
            validator: error
        }
    };
};

var validatorUndefinedError = function() {
    return {
        'status': 'error',
        'error': {
            code: cls.EXCEPTION.VALIDATOR_UNDEFINED_ERROR
        }
    };
};

var cycleError = function(chain) {
    return {
        'status': 'error',
        'error': {
            code: cls.EXCEPTION.ALIAS_CYCLE_ERROR,
            cycle: chain
        }
    }
};

var cls = function(cfg) {
    this._scope = cfg['scope'];
    this._target = {};
    this._validators = cfg['validators'];
};

cls.prototype = {
    compile: function() {
        var scopeStack = ScopeStack.getRootScopeStack(this._scope);
        var compileRes = this._compileScope(scopeStack, this._scope);
        if (compileRes['status'] == 'ok') {
            return this.checkNoCycle(this._target);
        } else {
            return compileRes;
        }
    },

    _compileScope: function(scopeStack, scope) {
        for (var name in scope) {
            var o = scope[name];
            if (o['type'] == 'Package') {
                var newScope = o['package'];
                var newScopeStack = scopeStack._clone();
                newScopeStack._push(name, newScope);
                var res = this._compileScope(newScopeStack, newScope);
                if (res['status'] == 'error') {
                    return packageError(name, res['error']);
                }
            } else {
                var res = this._compileType(scopeStack, o);
                if (res['status'] == 'error') {
                    return typeError(name, res['error']);
                }
                this._target[scopeStack.genName(name)] = res['data'];
            }
        }
        return ok();
    },

    _compileValidator: function(name, cfg) {
        if (this._validators[name] == null) {
            return validatorUndefinedError();
        } else {
            return ok();
        }
    },

    _compileType: function(scopeStack, type) {
        /*
        if (type['validator']) {
            var errors = {};
            var hasError = false;

            for (var name in type['validator']) {
                var cfg = type['validator'][name];
                var res = this._compileValidator(name, cfg);
                if (res['status'] == 'error') {
                    errors[name] = res['error'];
                    hasError = true;
                }
            }
            if (hasError) {
                return validatorError(errors);
            }
        }
        */

        switch(type['type']) {
            case 'Void':
            case 'Number':
            case 'String':
            case 'Literal':
            case 'Boolean':
                return ok(type);
            case 'Object':
                var fields = type['fields'];
                var errors = {};
                var hasError = false;
                var newFields = {};
                for (var fieldName in fields) {
                    var fieldType = fields[fieldName];
                    var res = this._compileType(scopeStack, fieldType);
                    if (res['status'] == 'error') {
                        errors[fieldName] = res['error'];
                        hasError =true;
                    } else {
                        newFields[fieldName] = res['data'];
                    }
                }
                if (hasError) {
                    return objectError(errors);
                } else {
                    var newType = {
                        "type": "Object",
                        "fields": newFields
                    };
                    if(type['mandatory'] != null) {
                        newType['mandatory'] = type['mandatory']
                    }
                    if(type['validator'] != null) {
                        newType['validator'] = type['validator']
                    }
                    return ok(newType);
                }
            case 'Array':
                var res = this._compileType(scopeStack, type['element']);
                if (res['status'] == 'ok') {
                    var newType = {
                        "type": "Array",
                        "element": res['data']
                    };
                    if(type['validator'] != null) {
                        newType['validator'] = type['validator']
                    }
                    return ok(newType);
                } else {
                    return arrayError(res['error']);
                }
            case 'Hash':
                var res = this._compileType(scopeStack, type['element']);
                if (res['status'] == 'ok') {
                    var newType = {
                        "type": "Array",
                        "element": res['data']
                    };
                    if(type['validator'] != null) {
                        newType['validator'] = type['validator']
                    }
                    return ok(newType);
                } else {
                    return arrayError(res['error']);
                }
            case 'Union':
                var variants = type['variants'];
                var errors = {};
                var hasError = false;
                var newVariants = {}
                for (var variantName in variants) {
                    var variantType = variants[variantName];
                    var res = this._compileType(scopeStack, variantType);
                    if (res['status'] == 'error') {
                        errors[variantName] = res['error'];
                        hasError =true;
                    } else {
                        newVariants[variantName] = res['data'];
                    }
                }
                if (hasError) {
                    return unionError(errors);
                } else {
                    var newType = {
                        "type": "Union",
                        "variants": newVariants
                    };
                    if(type['validator'] != null) {
                        newType['validator'] = type['validator']
                    }
                    return ok(newType);
                }
            case 'Alias':
                var name = type['name'];
                var path = type['path'] || [];
                try {
                    var res = scopeStack.lookupType(name, path);
                    var newType = {
                        "type": "Alias",
                        "name": res['scope'].genName(name)
                    };
                    if(type['validator'] != null) {
                        newType['validator'] = type['validator']
                    }
                    return ok(newType);
                } catch(e) {
                    return aliasError(e);
                }
            default:
                return typeTagError(type['type']);
        }
    },

    checkNoCycle: function(scope) {
        for (var k in scope) {
            var res = this._checkNoCycle(k, scope);
            if (res['status'] == 'error') {
                return res;
            }
        }
        return ok();
    },

    _checkNoCycle: function(name, scope) {
        var aliasChain = [name];
        while(true) {
            var o = scope[name];
            if (o['type'] == 'Alias') {
                name = o['name'];
                if ($U.contains(aliasChain, name)) {
                    return cycleError(aliasChain);
                } else {
                    aliasChain.push(name);
                }
            } else {
                return ok();
            }
        }
    }
};


$U.extend(cls, {
    EXCEPTION: {
        PACKAGE_ERROR: 'package_error',
        TYPE_ERROR: 'type_error',
        OBJECT_ERROR: 'object_error',
        UNION_ERROR: 'union_variant_error',
        ARRAY_ERROR: 'array_error',
        ALIAS_ERROR: 'alias_error',
        TYPE_TAG_ERROR: 'type_tag_error',
        VALIDATOR_ERROR: 'validator_error',
        VALIDATOR_UNDEFINED_ERROR: 'validator_undefined_error',
        ALIAS_CYCLE_ERROR: 'alias_cycle_error'
    }
});

module.exports = cls;
