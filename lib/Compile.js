var ScopeStack = require('./Scope');

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
                var newScopeStack = scopeStack._clone()._push(name, newScope);
                this._compileScope(newScopeStack, newScope);
            } else {
                this._compileType(scopeStack, o);
            }
        }
    },

    _compileType: function(scopeStack, type) {
        switch(type['type']) {
            case 'Number':
            case 'String':
            case 'Boolean':
                break;
            case 'Object':
                var fields = type['fields'];
                for (var fieldName in fields) {
                    var fieldType = fields[fieldName];
                    this._compileType(scopeStack, fieldType);
                }
                break;
            case 'Array':
                this._compileType(scopeStack, type['element']);
                break;
            case 'Union':
                var variants = type['variants'];
                for (var variantName in variants) {
                    var variantType = variants[variantName];
                    this._compileType(scopeStack, variantType);
                }
                break;
            case 'Alias':
                var alias = type['alias'];
                var path = type['path'] || [];
                scopeStack.lookupType(alias, path);
                break;
            default:
                var msg = '"' + type['type'] + '" is not a predefined type.';
                throw new Error(msg);
        }
    }
};

module.exports = cls;
