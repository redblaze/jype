
module.exports = {
    validateEmail: function(s) {
        var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
        return re.test(s);
    },

    validateDate: function(year, month, date) {
        var d = new Date(year, month, date);

        return d.getFullYear() == year
            && d.getMonth() == month
            && d.getDate() == date;
    },

    validateInteger: function(v) {
        return Math.floor(v) == v;
    }
};
