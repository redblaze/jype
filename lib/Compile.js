var $U = require('underscore');
var ScopeStack = require('./Scope');

var ok = function() {
    return {
        'status': 'ok'
    };
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
        return this._compileScope(scopeStack, this._scope);
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
            }
        }
        return ok();
    },

    _compileType: function(scopeStack, type) {
        switch(type['type']) {
            case 'Void':
            case 'Number':
            case 'String':
            case 'Boolean':
                return ok();
            case 'Object':
                var fields = type['fields'];
                var errors = {};
                var hasError = false;
                for (var fieldName in fields) {
                    var fieldType = fields[fieldName];
                    var res = this._compileType(scopeStack, fieldType);
                    if (res['status'] == 'error') {
                        errors[fieldName] = res['error'];
                        hasError =true;
                    }
                }
                if (hasError) {
                    return objectError(errors);
                } else {
                    return ok();
                }
            case 'Array':
                var res = this._compileType(scopeStack, type['element']);
                if (res['status'] == 'ok') {
                    return res;
                } else {
                    return arrayError(res['error']);
                }
            case 'Union':
                var variants = type['variants'];
                var errors = {};
                var hasError = false;
                for (var variantName in variants) {
                    var variantType = variants[variantName];
                    var res = this._compileType(scopeStack, variantType);
                    if (res['status'] == 'error') {
                        errors[variantName] = res['error'];
                        hasError =true;
                    }
                }
                if (hasError) {
                    return unionError(errors);
                } else {
                    return ok();
                }
            case 'Alias':
                var alias = type['alias'];
                var path = type['path'] || [];
                try {
                    scopeStack.lookupType(alias, path);
                    return ok();
                } catch(e) {
                    return aliasError(e);
                }
            default:
                return typeTagError(type);
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
        TYPE_TAG_ERROR: 'type_tag_error'
    }
});

module.exports = cls;
