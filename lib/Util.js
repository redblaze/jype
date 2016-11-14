var Util = {
    cloneArray: function(a) {
        var cloned = [];

        for (var i = 0; i < a.length; i++) {
            cloned.push(a[i]);
        }

        return cloned;
    },

    extendObj: function(dst, src) {
        for (var k in src) {
            dst[k] = src[k];
        }
    }
};

module.exports = Util;