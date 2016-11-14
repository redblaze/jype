
var validators = {
    'isEmail': {
        check: function(s) {
            var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
            return re.test(s);
        },
        errorMessage: function(v) {
            return v + ' is not a valid email address.';
        }
    },

    'isDateObject': {
        check: function(v) {
            var d = new Date(v['year'], v['month'], v['date']);

            return d.getFullYear() == v['year']
                && d.getMonth() == v['month']
                && d.getDate() == v['date'];
        },
        errorMessage: function(v) {
            return v['month'] + '/' + v['date'] + '/' + v['year'] + ' is not a valid date.';
        }
    },

    'future': {
        check: function(v) {
            return v > Date.now();
        },
        errorMessage: function(v) {

        }
    },

    'isInteger': {
        check: function(v) {
            return Math.floor(v) == v;
        }
    },

    'size': {
        cfg: {
            'limit': 'Number'
        },
        check: function(v, cfg) {
            return v.length < cfg['limit'];
        }
    },

    'mandatory': {
        check: function(v) {
            return !(v === null || v === undefined);
        }
    }
};


module.exports = validators;
