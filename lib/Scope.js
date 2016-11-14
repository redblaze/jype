var Util = require('./Util');

var cls = function(stack) {
    if (!stack) {
        stack = [];
    }
    this._stack = stack;
};

cls.prototype = {
    _push: function(name, scope) {
        this._stack.push({
            name: name,
            scope: scope
        });
    },

    _pop: function() {
        return this._stack.pop();
    },

    _top: function() {
        return this._stack[this._stack.length - 1];
    },

    _isEmpty: function() {
        return this._stack.length == 0;
    },

    _clone: function() {
        return new Scope(Util.cloneArray(this._stack));
    },

    _getPath: function() {
        var path = [];

        for (var i = 0; i < this._stack.length; i++) {
            path.push(this._stack[i].name);
        }

        return path;
    },

    _throwNameNotFoundError: function(name) {
        var path = this._getPath();
        var msg = 'Name: "' + name + '" is not found in any scope along the path "' + path.join('/') + '".';
        throw new Error(msg);
    },

    _getScopeByName: function(name) {
        var scope = this._clone();
        while(!scope._isEmpty()) {
            var current = scope.top();
            if (current['scope'][name]) {
                return scope;
            } else {
                scope._pop();
            }
        }
        this._throwNameNotFoundError(name);
    },

    _throwPackageNotFoundError: function(name) {
        var path = this._getPath();
        var msg = 'Package : "' + name + '" is not found in the scope at path "' + path.join('/') + '".';
        throw new Error(msg);
    },

    _getExtendedScopeByPath: function(path) {
        var scope = this._clone();

        for (var i = 0; i < path.length; i++) {
            var top = scope._top();
            var packageName = path[i];
            var package = top['scope'][packageName];
            if (package && package['type'] == 'Package') {
                scope._push(packageName, package['package']);
            } else {
                scope._throwPackageNotFoundError(packageName);
            }
        }
        return scope;
    },

    _throwTypeNotFoundError: function(name) {
        var path = this._getPath();
        var msg = 'Type: "' + name + '" is not found in the scope at path "' + path.join('/') + '".';
        throw new Error(msg);
    },

    _getTypeByName: function(name) {
        var top = this._top();
        var tyype = top['scope'][name];
        if (type) {
            return type;
        } else {
            this._throwTypeNotFoundError(name);
        }
    },

    lookupType: function(typeName, path) {
        var name = path[0];
        if (!name) {
            name = typeName;
        }

        var newScope = this._getScopeByName(name);
        newScope = newScope._getExtendedScopeByPath(path);

        return {
            scope: newScope,
            type: newScope._getTypeByName(typeName)
        }
    }
};

cls.getRootScopeStack = function(scope) {
    return new cls([{
        name: '__root__',
        scope: scope
    }]);
};

module.exports = cls;
