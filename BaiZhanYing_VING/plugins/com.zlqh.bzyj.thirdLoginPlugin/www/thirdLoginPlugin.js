var ThirdLoginPlugin = function() {

};

ThirdLoginPlugin.prototype.qqLogin = function(success, fail, options) {

    return cordova.exec(success, fail, "ThirdLoginPlugin", "qqLogin",options);
};
ThirdLoginPlugin.prototype.wechatLogin = function(success, fail, options) {

    return cordova.exec(success, fail, "ThirdLoginPlugin", "wechatLogin",options);
};

window.thirdLoginPlugin = new ThirdLoginPlugin();