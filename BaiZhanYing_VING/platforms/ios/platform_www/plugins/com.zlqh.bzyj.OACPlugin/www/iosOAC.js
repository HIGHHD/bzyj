cordova.define("com.zlqh.bzyj.OACPlugin.OpenAccount", function(require, exports, module) { var OpenAccount = function() {

};

OpenAccount.prototype.presentOAC = function(success, fail, options) {

    return cordova.exec(success, fail, "OpenAccount", "presentOAC",options);
};

window.openAccount = new OpenAccount();
});
