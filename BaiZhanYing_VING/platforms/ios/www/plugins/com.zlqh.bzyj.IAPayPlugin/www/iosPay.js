cordova.define("com.zlqh.bzyj.IAPayPlugin.JustPay", function(require, exports, module) { var JustPay = function() {

};

JustPay.prototype.getStarInfo = function(success, fail, options) {

    return cordova.exec(success, fail, "JustPay", "getStarInfo",options);
};

window.justPay = new JustPay();
});
