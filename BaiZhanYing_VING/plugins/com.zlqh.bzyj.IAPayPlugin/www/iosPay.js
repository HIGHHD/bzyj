var JustPay = function() {

};

JustPay.prototype.getStarInfo = function(success, fail, options) {

    return cordova.exec(success, fail, "JustPay", "getStarInfo",options);
};

window.justPay = new JustPay();