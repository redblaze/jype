var _merge = function(path, scope1, scope2) {
    for (var name in scope2) {
        var type1 = scope1[name];
        var type2 = scope2[name];

        if (type1) {
            if (type1['type'] == 'Package' && type2['type'] == 'Package') {
                _merge(path.concat([name]), type1['package'], type2['package']);
            } else {
                throw new Error('Cannot merge name: "' + name + '" in path "' + path.join('/') + '".');
            }
        } else {
            scope1[name] =  type2;
        }
    }
    return scope1;
};

var merge = function(scope1, scope2) {
    return _merge([], scope1, scope2);
};

module.exports = merge;