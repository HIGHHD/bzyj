var  basicUrl = "111.205.107.195";
var defaultUrl = 'https://'+basicUrl+'/Sns/service/pushInterface/';
var PayServerIp = 'https://'+basicUrl+":9633";
//196的端口为15121
//195的端口为15825
var httpPort = ":15825"
var chatUrl = "ws://"+basicUrl+httpPort;

var needAccountLogin = true;
var isAccountLogin = false;
var visitor = "721519201234";
var visitorPW = "123456";
var isVisitor = false;

var temp = {};
//品种交易合约starID
var VECstarId = '667dd6e0a688444d972f98a199388acc';
var riskCalculator = "31441328fbaf4a758e8e78040e96cd4e";
var needAccountLoginStar = "667dd6e0a688444d972f98a199388acc";
var userBalanceStarId = "a971217d21434ddfbbe402a57d3a120e";
var userPerformanceStarId = "fd017e4e0e0e40738d3f53865a4596cb";
var zjAccount = "";
var zjPassword = "";
var type = "";
var chartUrl = "";
var performanceData = "";
var chartData = "";

angular.module('starter', ['ionic', 'ngResource', 'ngSanitize', 'ngCordova'])
    .directive('hideTabs', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $rootScope.hideTabs = 'tabs-item-hide';
                $scope.$on('$destroy', function () {
                    $rootScope.hideTabs = '';
                })
            }
        }
    }])

    .factory('wsService', ['$timeout', '$rootScope', '$localstorage', function ($timeout, $rootScope, $localstorage) {
        var websocket;
        var forcedClose = false;
        var reconnect = false;
        var timeOut = false;
        var reconnectInterval = 1000;
        var maxReconnectInterval = 30000;
        var reconnectDecay = 1.5;
        var timeoutInterval = 2000;
        var maxReconnectAttempts = null;
        var reconnectAttempts = 0;
        var _urls;
        var service = {};
        service.init = function (url, protocols) {
            _urls = url;

            var user2 = $localstorage.getObject('user');
            //alert("service.init");
            if ('WebSocket' in window) {
                websocket = new WebSocket(_urls, protocols || []);

                var localWs = websocket;
                reconnectAttempts = 0;
                var timeout = $timeout(function () {
                    timeOut = true;
                    localWs.close();
                    timeOut = false;
                }, timeoutInterval);
                //alert(angular.toJson(websocket));
                websocket.onopen = function (event) {

                    $timeout.cancel(timeout);
                    reconnectAttempts = 0;
                    $rootScope.$broadcast('wsService:onopen', event);

                    var sendParam = {};
                    sendParam.type = "login";
                    sendParam.userId = user2.id.toString();

                    websocket.send(angular.toJson(sendParam));
                    //alert(angular.toJson(sendParam));
                    reconnect = true;
                };

                websocket.onclose = function () {
                    $timeout.cancel(timeout);
                    websocket = null;

                    if (forcedClose) {

                    } else {
                        //延时pow指定次数的指数次幂
                        var timeout = reconnectInterval * Math.pow(reconnectDecay, reconnectAttempts);
                        $timeout(function () {
                            reconnectAttempts++;
                            service.init(_urls);
                        }, timeout > maxReconnectInterval ? maxReconnectInterval : timeout);
                    }
                };

                websocket.onmessage = function (message) {
                    //接收到服务器消息后调用
                    $rootScope.$broadcast('wsService:onmessage', message);


                };

                websocket.onerror = function () {
                    $rootScope.$broadcast('wsService:onerror');

                    //alert("onerror");
                };
                //关闭或者刷新时调用
                window.onbeforeunload = function () {
                    websocket.close();

                };
            }
            else {
                alert('Not support websocket');
            }
        }
        service.send = function (data) {
            //alert(angular.toJson(data));
            if (websocket) {
                data.type = 'say';
                //alert("service.send");
                return websocket.send(angular.toJson(data));

            } else {
                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
                //alert("Pausing to reconnect websocket");
            }
        }

        //1000调用本方法关闭socket(向服务端发送)
        service.close = function (code, reason) {
            if (typeof code === 'undefined') {
                code = 1000;
            }
            forcedClose = true;
            if (websocket) {
                websocket.close(code, reason);

            }
        }
        service.refresh = function () {
            if (websocket) {
                websocket.close();
            }
        }

        return service;
    }])

    .factory('JpushService', ['$rootScope', '$timeout', '$state', function ($rootScope, $timeout, $state) {

        var onOpenNotification = function (event) {
            try {
                var alertContent;
                var alertExtras;
                var devicePlatform = ionic.Platform.platform();
                if (devicePlatform == "android") {
                    alertContent = window.plugins.jPushPlugin.openNotification.alert;
                    alertExtras = window.plugins.jPushPlugin.openNotification.extras;
                } else {
                    alertContent = event.aps.alert;
                    alertExtras = event;

                }
                //alert(alertContent);

            }
            catch (exception) {
                console.log("JPushPlugin:onOpenNotification" + exception);
            }
            $timeout(function () {
                $rootScope.$broadcast('JpushService:openNotification', alertContent, alertExtras);

                if ($state.current.name == 'tab.fwlist') {
                    $rootScope.$broadcast('JpushService:openNotificationCurrentList', alertContent, alertExtras);
                }
            }, 2000);
        }
        var onReceiveNotification = function (event) {
            try {
                var alertContent;
                var alertExtras;
                var devicePlatform = ionic.Platform.platform();
                if (devicePlatform == "android") {
                    alertContent = window.plugins.jPushPlugin.receiveNotification.alert;
                    alertExtras = window.plugins.jPushPlugin.receiveNotification.extras;
                } else {
                    alertContent = event.aps.alert;
                    alertExtras = event;
                }
            }
            catch (exeption) {
                console.log(exception)
            }
            $timeout(function () {
                $rootScope.$broadcast('JpushService:receiveNotification', alertContent, alertExtras);
            });
        }
//        var onReceiveMessage = function(event){
//            try{
//
//                var message;
//                var extras;
//                var devicePlatform = ionic.Platform.platform();
//                if(devicePlatform == "android"){
//                    message = window.plugins.jPushPlugin.receiveMessage.message;
//                    extras = window.plugins.jPushPlugin.receiveMessage.extras;
//                }else {
//                    message   = event.content;
//                    extras = event.extras;
//                }
//            }
//            catch(exception){
//                console.log("JPushPlugin:onReceiveMessage-->"+exception);
//            }
//            $timeout(function(){
//                $rootScope.$broadcast('JpushService:receiveMessage',message,extras);
//            })
//        }
        var push;
        return {

            setTagsWithAlias: function (tags, alias) {
                if (push) {
                    try {
                        window.plugins.jPushPlugin.setTagsWithAlias(tags, alias);
                    } catch (exception) {
                        console.log(exception);
                    }
                }

            },

            setTags: function (tags) {
                if (push) {
                    alert(tags);
                    try {
                        window.plugins.jPushPlugin.setTags(tags);
                    }
                    catch (exception) {
                        console.log(exception);
                    }
                }
            },
            //iOS single
            setBadge: function (badge) {
                if (push) {
                    if (window.plugins.jPushPlugin.isPlatformIOS()) {
                        window.plugins.jPushPlugin.setBadge(badge);
                    }

                }
            },
            //iOS single
            setApplicationIconBadgeNumber: function (badge) {
                if (window.plugins.jPushPlugin.isPlatformIOS()) {
                    window.plugins.jPushPlugin.setApplicationIconBadgeNumber(badge);
                }
            },

            setAlias: function (alias) {
                if (push) {
                    window.plugins.jPushPlugin.setAlias(alias);
                }
            },
            check: function () {
                if (window.jpush && push) {
                    plugins.jPushPlugin.receiveNotificationIniOSCallback(window.jpush);
                    window.jpush = null;
                }
            },
            init: function () {

                push = window.plugins && window.plugins.jPushPlugin;
                if (push) {


                    window.plugins.jPushPlugin.init();

                    window.plugins.jPushPlugin.setDebugMode(true);

                    document.addEventListener("jpush.openNotification", onOpenNotification, false);

                    document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);

//                    document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
//                             window.plugins.jPushPlugin.prototype.reSetBadge();
                }
            }
        };
    }])
    //缓冲对话框
    .factory('BusyService', ['$ionicLoading', function ($ionicLoading) {
        return {
            show: function (content) {
                $ionicLoading.show({
                    template: content || '正在加载...',
                    animation: 'fade-in'
                });
            },
            hide: function () {
                $ionicLoading.hide();
            }
        };
    }])
    .factory('StoreUp', ['$resource', function ($resource) {
        return $resource(defaultUrl, null,
            {}
        )
    }])

    .factory('LastTime', ['$localstorage', '$filter', function ($localstorage, $filter) {


        return {
            //没用到
            getLastExitTime: function () {
                return $localstorage.get('lastExitTime', $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
            },
            setExitTime: function () {
                $localstorage.set('lastExitTime', $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
            },
            getLastRequestTime: function () {
                return $localstorage.get('lastRequestTime');
            },
            setRequestTime: function (lrt) {
                $localstorage.set('lastRequestTime', $filter('date')(lrt == null ? new Date() : lrt, 'yyyy-MM-dd HH:mm:ss'));
            },
            ///没用到
            getLastChatTime: function () {
                return $localstorage.get('lastChatTime');
            },
            setLastChatTime: function (lrt) {
                $localstorage.set('lastChatTime', $filter('date')(lrt == null ? new Date() : lrt, 'yyyy-MM-dd HH:mm:ss'));
            }

        }
    }])
    /**
     * uuid收藏里用到了
     */
    .factory('UUIDFac', function () {
        function UUID() {
            this.id = this.createUUID();
        }


        UUID.prototype.valueOf = function () {
            return this.id;
        };
        UUID.prototype.toString = function () {
            return this.id;
        };


        UUID.prototype.createUUID = function () {


            var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
            var dc = new Date();
            var t = dc.getTime() - dg.getTime();
            var tl = UUID.getIntegerBits(t, 0, 31);
            var tm = UUID.getIntegerBits(t, 32, 47);
            var thv = UUID.getIntegerBits(t, 48, 59) + '1';
            var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
            var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);


            var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
                UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
                UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
                UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
                UUID.getIntegerBits(UUID.rand(8191), 0, 15);
            return tl + tm + thv + csar + csl + n;
        };


        UUID.getIntegerBits = function (val, start, end) {
            var base16 = UUID.returnBase(val, 16);
            var quadArray = new Array();
            var quadString = '';
            var i = 0;
            for (i = 0; i < base16.length; i++) {
                quadArray.push(base16.substring(i, i + 1));
            }
            for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
                if (!quadArray[i] || quadArray[i] == '') quadString += '0';
                else quadString += quadArray[i];
            }
            return quadString;
        };


        UUID.returnBase = function (number, base) {
            return (number).toString(base).toUpperCase();
        };


        UUID.rand = function (max) {
            return Math.floor(Math.random() * (max + 1));
        };
        return {
            getUUID: function () {
                return new UUID();
            }
        }
    })
    /**
     * 推荐业务员，只注入没用到
     */
    /*.factory('TjywyService',function(){
     var ywys = [{
     id: '0',
     name: '业务员1',
     ywyClass: '5级',
     headImg: '',
     lastStarInfoTime: '2015年2月1日'
     },{
     id: '1',
     name: '业务员2',
     ywyClass: '5级',
     headImg: '',
     lastStarInfoTime: '2015年2月1日'
     },{
     id: '2',
     name: '业务员3',
     ywyClass: '4级',
     headImg: '',
     lastStarInfoTime: '2015年2月1日'
     },{
     id: '3',
     name: '业务员4',
     ywyClass: '2级',
     headImg: '',
     lastStarInfoTime: '2015年2月2日'
     }];
     return {
     all: function() {
     return ywys;
     },
     remove: function(ywy) {
     //删除操作
     ywys.splice(ywys.indexOf(ywy), 1);
     },
     get: function(ywyId) {
     for (var i = 0; i < ywys.length; i++) {
     if (ywys[i].id === parseInt(ywyId)) {
     return ywys[i];
     }
     }
     return null;
     }
     }

     })*/
    .factory('webLocalDB',function(){
        try{
            var db = window.openDatabase('mydb','1.0','我的第一个客户端数据库',2*1024*1024);
        }catch (err){
            alert(err.message);
        }
        if(!db)alert("不能连接到数据库！");
        db.transaction(callback);
        function callback(tx){
            var sql = "create table star(id text," +
                "name text," +
                "newName text," +
                "lastStarInfoTitle text," +
                "category integer," +
                "price real," +
                "createTime numeric," +
                "createUser text," +
                "lastStarInfoTime numeric," +
                "buyEndTime numeric," +
                "sn text," +
                "description text," +
                "headImg text," +
                "badge numeric," +
                "ownUser text," +
                "eStarUserId text," +
                "needBuy text," +
                "primary key(id,ownUser))";
            tx.executeSql(sql);
            sql = "create table starInfo(id text," +
                "starId text," +
                "title text," +
                "headImg text," +
                "message text," +
                "messageType integer," +
                "dateTime numeric," +
                "createUser text," +
                "price numeric," +
                "ownUser text," +
                "addFile text," +
                "fileName text," +
                "primary key(id,ownUser))";
            tx.executeSql(sql);
            sql = "create table starBuy(id text," +
                "starId text," +
                "isBuy text," +
                "buyStartTime numeric," +
                "buyEndTime numeric," +
                "ownUser text," +
                "primary key(id,ownUser)" +
                ")";
            tx.executeSql(sql);
            sql = "create table chat(id text," +
                "userId text," +
                "message text," +
                "time numeric," +
                "ownUser text," +
                "isSendSuccess integer," +
                "primary key(id,ownUser))"
            tx.executeSql(sql);
            sql = "create table storeUp(id text," +
                "starInfoId text," +
                "title text," +
                "description text," +
                "message text," +
                "datetime numeric," +
                "userName text," +
                "headImg text," +
                "ownUser text," +
                "primary key(id,ownUser))";
            tx.executeSql(sql);
            sql = "create table chatUser(userId text," +
                "badge numeric," +
                "lastMessage text," +
                "lastTime numeric," +
                "ownUser text," +
                "primary key(userId,ownUser))";
            tx.executeSql(sql);

        }
        return {
            getDb : function() {
                return db;
            },

            //没用到
            insertStarBuy : function(starBuy){
                db.transaction(callback);
                function callback(tx){
                    var sql = "insert into starBuy(id,starId,isBuy,buyStartTime,buyEndTime,ownUser) values (?,?,?,?,?,?)";
                    var starBuyArr = new Array();
                    starBuyArr[0] = starBuy.id;
                    starBuyArr[1] = starBuy.starId;
                    starBuyArr[2] = starBuy.isBuy;
                    starBuyArr[3] = starBuy.buyStartTime;
                    starBuyArr[4] = starBuy.buyEndTime;
                    starBuyArr[5] = starBuy.ownUser;
                    tx.executeSql(sql,starBuyArr);
                }
            },
            //没用到
            updateStarBuy : function(){
                db.transaction(callback);
                function callback(tx){
                    var sql = "update starBuy set ";

                    if(starBuy.isBuy != "" && starBuy.isBuy != null && starBuy.isBuy != undefined){
                        sql += "isBuy = '" + starBuy.isBuy + "', ";
                    }
                    if(starBuy.buyStartTime != "" && starBuy.buyStartTime != null && starBuy.buyStartTime != undefined){
                        sql += "buyStartTime = '" + starBuy.buyStartTime + "', ";
                    }
                    if(starBuy.buyEndTime != "" && starBuy.buyEndTime != null && starBuy.buyEndTime != undefined){
                        sql += "buyEndTime = '" + starBuy.buyEndTime + "', ";
                    }

                    sql = sql.substring(0,sql.length-2);
                    sql += " where starId = '" + starBuy.starId + "' and ownUser = '" + starBuy.ownUser + "'";
                    tx.executeSql(sql,[],sCallback,eCallback);
                    function sCallback(tx,result){

                    }
                    function eCallback(tx,err){
                        console.log(err);
                    }
                }
            },

            //没用到
            selectStarInfoById : function(starInfoId,ownUser,selectStarInfoResult){
                db.transaction(callback);
                function callback(tx){

                    // var sql = "select * from starInfo where id = '" + starInfoId + "' and ownUser = '" + ownUser + "'";
                    var sql = "select id,starId,title,headImg,message,messageType,dateTime,createUser,price,ownUser,addFile,fileName from starInfo where id = '" + starInfoId + "' and ownUser = '" + ownUser + "'";
                    tx.executeSql(sql,[],selectStarInfoResult,errResult);
                }
                function errResult(tx,err){
                    console.log(err.message);
                }
            },

            //没用到
            selectStarInfoList : function(starId,ownUser,pageSize,pageIndexs,selectStarInfoResult){
                db.transaction(callback);
                function callback(tx){
                    //var sql = "select * from starInfo where starId = '" + starId + "' and ownUser = '" + ownUser + "' ";
                    var sql = "select id,starId,title,headImg,message,messageType,dateTime,createUser,price,ownUser,addFile,fileName from starInfo where starId = '" + starId + "' and ownUser = '" + ownUser + "' ";



                    sql += " order by dateTime desc ";
                    pageIndexs = pageIndexs - 1;
                    sql += " limit " + pageSize + " offset "+ pageSize*pageIndexs;
                    tx.executeSql(sql,[],selectStarInfoResult,errResult);

                }
                function errResult(tx,err){
                    console.log(err.message);
                }
            },

            //没用到
            insertStarInfo :function(starInfo){
                db.transaction(callback);
                function callback(tx){
                    var sql = "insert into starInfo (id,starId,title,headImg,message,messageType,dateTime,ownUser,addFile,fileName) values(?,?,?,?,?,?,?,?,?,?)";
                    var starInfoArr = new Array();
                    starInfoArr[0] = starInfo.id;
                    starInfoArr[1] = starInfo.starId;
                    starInfoArr[2] = starInfo.title;
                    starInfoArr[3] = starInfo.headImg;
                    starInfoArr[4] = starInfo.message;
                    starInfoArr[5] = starInfo.messageType;
                    starInfoArr[6] = starInfo.dateTime;
                    starInfoArr[7] = starInfo.ownUser;
                    starInfoArr[8] = starInfo.addFile;
                    starInfoArr[9] = starInfo.fileName;
                    tx.executeSql(sql,starInfoArr,sCallback,eCallback);
                    function sCallback(tx,result){

                    }
                    function eCallback(tx,err){

                    }
                }
            },


            //没用到
            updateStarInfo : function(starInfo){
                db.transaction(callback);
                function callback(tx){
                    var sql = "update starInfo set ";
                    if(starInfo.starId != "" && starInfo.starId != null && starInfo.starId != undefined){
                        sql += "starId = '" + starInfo.starId + "', ";
                    }
                    if(starInfo.title != "" && starInfo.title != null && starInfo.title != undefined){
                        sql += "title = '" + starInfo.title + "', ";
                    }
                    if(starInfo.headImg != "" && starInfo.headImg != null && starInfo.headImg != undefined){
                        sql += "headImg = '" + starInfo.headImg + "', ";
                    }
                    if(starInfo.message != "" && starInfo.message != null && starInfo.message != undefined){
                        sql += "message = '" + starInfo.message + "', ";
                    }
                    if(starInfo.messageType != "" && starInfo.messageType != null && starInfo.messageType != undefined){
                        sql += "messageType = '" + starInfo.messageType + "', ";
                    }
                    if(starInfo.addFile != "" && starInfo.addFile != null && starInfo.addFile != undefined){
                        sql += "addFile = '" + starInfo.addFile + "', ";
                    }
                    if(starInfo.fileName != "" && starInfo.fileName != null && starInfo.fileName != undefined){
                        sql += "fileName = '" + starInfo.fileName + "', ";
                    }
                    sql = sql.substring(0,sql.length-2);
                    sql += " where id = '" + starInfo.id + "' and ownUser = '" + starInfo.ownUser + "'";
                    tx.executeSql(sql,[],sCallback,eCallback);
                    function sCallback(tx,result){

                    }
                    function eCallback(tx,err){
                        console.log(err);
                    }
                }
            },
            //没用到
            cdStar : function(stars,ownUserId,category){
                db.transaction(callback);
                function callback(tx){
                    var sql = "delete from star where ownUser = ? and category = ?";
                    tx.executeSql(sql,[ownUserId,category]);
                    sql = "insert into star(id,name,newName,lastStarInfoTitle,category,lastStarInfoTime,headImg,badge,ownUser,price,buyEndTime,description) values (?,?,?,?,?,?,?,?,?,?,?,?)";
                    for(var i=0; i < stars.length; i++){
                        var star = stars[i];
                        var starArr = new Array();
                        starArr[0] = star.id;
                        starArr[1] = star.name;
                        starArr[2] = star.newName;
                        starArr[3] = star.lastStarInfoTitle;
                        starArr[4] = star.category;
                        starArr[5] = star.lastStarInfoTime;
                        starArr[6] = star.headImg;
                        starArr[7] = star.badge;
                        starArr[8] = star.ownUser;
                        starArr[9] = star.price;
                        starArr[10] = star.buyEndTime;
                        starArr[11] = star.description;
                        tx.executeSql(sql,starArr);
                    }
                }
            },
            deleteStar : function() {
                db.transaction(callback);
                function callback(tx){
                    var sql = "delete from star";
                    //             var starArr = new Array();
                    //             starArr[0] = star.eStarUserId;
                    tx.executeSql(sql,[]);
                }
            },
            selectStar : function(ownUser,selectStarResult){
                db.transaction(callback);
                function callback(tx){
                    // var sql = "select * from star where ownUser = '"+ownUser+"' order by lastStarInfoTime desc";
                    var sql = "select id,name,newName,lastStarInfoTitle,category,price,createTime,createUser,lastStarInfoTime,sn,headImg,badge,ownUser,eStarUserId,price,buyEndTime,description,needBuy from star where ownUser = '"+ownUser+"' order by lastStarInfoTime desc";

                    tx.executeSql(sql,[],selectStarResult,queryError);
                }
                function queryError(tx,err){
                }
            },
            selectStarById : function(starId,ownUser,selectStarResult){
                db.transaction(callback);
                function callback(tx){
                    // var sql = "select * from star where id = '" + starId + "' and ownUser = '" + ownUser + "'";
                    var sql = "select id,name,newName,lastStarInfoTitle,category,price,createTime,createUser,lastStarInfoTime,sn,headImg,badge,ownUser,eStarUserId,price,buyEndTime,description from star where id = '" + starId + "' and ownUser = '" + ownUser + "'";
                    tx.executeSql(sql,[],selectStarResult,queryError);
                }
                function queryError(tx,err){
                    console.log(err.message);
                }
            },
            insertStar : function(star) {
                db.transaction(callback);
                function callback(tx){
                    var sql = "insert into star(id,name,newName,lastStarInfoTitle,category,lastStarInfoTime,headImg,badge,ownUser,eStarUserId,price,buyEndTime,description,createTime,needBuy) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    var starArr = new Array();
                    starArr[0] = star.id;
                    starArr[1] = star.name;
                    starArr[2] = star.newName;
                    starArr[3] = star.lastStarInfoTitle;
                    starArr[4] = star.category;
                    starArr[5] = star.lastStarInfoTime;
                    starArr[6] = star.headImg;
                    starArr[7] = star.badge;
                    starArr[8] = star.ownUser;
                    starArr[9] = star.eStarUserId;
                    starArr[10] = star.price;
                    starArr[11] = star.buyEndTime;
                    starArr[12] = star.description;
                    starArr[13] = star.createTime;
                    starArr[14] = star.needBuy;
                    tx.executeSql(sql,starArr);
                }

            },
            updateStar : function(star){
                db.transaction(callback);
                function callback(tx){
                    var sql = "update star set ";
                    if(star.name != "" && star.name != null && star.name != undefined){
                        sql += " name = '" + star.name + "', ";
                    }
                    if(star.lastStarInfoTitle != "" && star.lastStarInfoTitle != null && star.lastStarInfoTitle != undefined){
                        sql += " lastStarInfoTitle = '" + star.lastStarInfoTitle + "', ";
                    }
                    if(star.lastStarInfoTime != "" && star.lastStarInfoTime != null && star.lastStarInfoTime != undefined){
                        sql += " lastStarInfoTime = '" + star.lastStarInfoTime + "', ";
                    }
                    if(star.headImg != "" && star.headImg != null && star.headImg != undefined){
                        sql += " headImg = '" + star.headImg + "', ";
                    }
                    if(star.badge != "" && star.badge != null && star.badge != undefined){
                        sql += " badge += " + star.badge + ", ";
                    }
                    if(star.eStarUserId != "" && star.eStarUserId != null && star.eStarUserId != undefined){
                        sql += " eStarUserId = '" + star.eStarUserId + "', ";
                    }
                    if(star.price != "" && star.price != null && star.price != undefined){
                        sql += " price = '" + star.price + "', ";
                    }
                    if(star.buyEndTime != "" && star.buyEndTime != null && star.buyEndTime != undefined){
                        sql += " buyEndTime = '" + star.buyEndTime + "', ";
                    }
                    if(star.description != "" && star.description != null && star.description != undefined){
                        sql += " description = '" + star.description + "', ";
                    }
                    if(star.createTime != "" && star.createTime != null && star.createTime != undefined){
                        sql += " createTime = '" + star.createTime + "', ";
                    }
                    if(star.needBuy != "" && star.needBuy != null && star.needBuy != undefined){
                        sql += " needBuy = '" + star.needBuy + "', ";
                    }
                    sql = sql.substring(0,sql.length-2);
                    sql += " where id = '" + star.id + "' and ownUser = '" + star.ownUser + "'";
                    tx.executeSql(sql,[],sCallback,eCallback);
                }
                function sCallback(tx,result){

                }
                function eCallback(tx,err){
                    console.log(err);
                }
            },
            clearStarBadge : function(id){
                db.transaction(callback);
                function callback(tx){
                    var sql = "update star set badge = 0 where id = '" + id + "'";
                    tx.executeSql(sql,[]);
                }
            },
            insertChat : function(chat) {
                db.transaction(callback);
                function callback(tx){
                    var sql = "insert into chat(id,userId,message,time,ownUser,isSendSuccess) values (?,?,?,?,?,?)";
                    var chatArr = new Array();
                    chatArr[0] = chat.id;
                    chatArr[1] = chat.userId;
                    chatArr[2] = chat.info;
                    chatArr[3] = chat.time;
                    chatArr[4] = chat.ownUser;
                    chatArr[5] = chat.isSendSuccess;
                    tx.executeSql(sql,chatArr);
                }
            },
            insertChatUser : function(chatUser) {
                db.transaction(callback);
                function callback(tx){
                    var sql = "insert into chatUser(userId,badge,lastMessage,lastTime,ownUser) values (?,?,?,?,?)";
                    var chatUserArr = new Array();
                    chatUserArr[0] = chatUser.userId.toString();
                    chatUserArr[1] = chatUser.badge;
                    chatUserArr[2] = chatUser.lastMessage;
                    chatUserArr[3] = chatUser.lastTime;
                    chatUserArr[4] = chatUser.ownUser.toString();
                    tx.executeSql(sql,chatUserArr);
                }
            },
            updateChatUser : function(chatUser) {
                db.transaction(callback);
                function callback(tx){
                    var sql = "update chatUser set ";
                    if(chatUser.badge != "" && chatUser.badge != null && chatUser.badge != undefined){
                        sql += "badge += " + chatUser.badge + ", ";
                    }
                    if(chatUser.lastMessage != "" && chatUser.lastMessage != null && chatUser.lastMessage != undefined){
                        sql += "lastMessage = '" + chatUser.lastMessage + "', ";
                    }
                    if(chatUser.lastTime != "" && chatUser.lastTime != null && chatUser.lastTime != undefined){
                        sql += "lastTime = '" + chatUser.lastTime + "', ";
                    }
                    sql = sql.substring(0,sql.length-2);
                    sql += " where userId = '" + chatUser.userId + "'";
                    tx.executeSql(sql);
                }
            },
            clearChatUserBadge : function(userId) {
                db.transaction(callback);
                function callback(tx){
                    var sql = "update chatUser set badge = 0 where userId = '" + userId + "'";
                    tx.executeSql(sql,[]);
                }
            },
            selectChatUser : function(ownUser,selectChatUserResult){
                db.transaction(callback);
                function callback(tx){
                    //var sql = "select * from chatUser where ownUser = '" + ownUser + "'";
                    var sql = "select userId,badge,lastMessage,lastTime,ownUser from chatUser where ownUser = '" + ownUser + "'";
                    tx.executeSql(sql,[],selectChatUserResult,queryError);
                }
                function queryError(tx,err){
                    console.log(err);
                }
            },
            deleteChatUser : function(ownUser){
                db.transaction(callback);
                function callback(tx){
                    var sql = "delete from chatUser where ownUser = '" + ownUser + "'";
                    tx.executeSql(sql,[]);
                }
            },
            insertStoreUp : function(storeUp){
                db.transaction(callback);
                function callback(tx){
                    var sql = "insert into storeUp(id,title,message,datetime,userName,ownUser,headImg,starInfoId) values(?,?,?,?,?,?,?,?)";
                    var storeUpArr = new Array();
                    storeUpArr[0] = storeUp.id;
                    storeUpArr[1] = storeUp.name;
                    storeUpArr[2] = storeUp.content;
                    storeUpArr[3] = storeUp.datetime;
                    storeUpArr[4] = storeUp.userName;
                    storeUpArr[5] = storeUp.userId;
                    storeUpArr[6] = storeUp.headImg;
                    storeUpArr[7] = storeUp.starInfoId;
                    tx.executeSql(sql,storeUpArr);
                }
            },
            deleteStoreUp : function(id){
                db.transaction(callback);
                function callback(tx){
                    var sql = "delete from storeUp where id = '" + id + "'";
                    tx.executeSql(sql,[]);
                }
            },

            searchStoreUp : function(searchContent,ownUser,selectStoreUpResult){
                db.transaction(callback);
                function callback(tx){
                    //var sql = "select * from storeUp where title like '%" + searchContent +"%' or message like '%" + searchContent + "%' and ownUser = " + ownUser;
                    var sql = "select id,starInfoId,title,description,message,datetime,userName,headImg,ownUser from storeUp where title like '%" + searchContent +"%' or message like '%" + searchContent + "%' and ownUser = " + ownUser;
                    tx.executeSql(sql,[],selectStoreUpResult,queryError);
                }
                function queryError(tx,err){
                }

            },
            selectStoreUp : function(ownUser,selectStoreUpResult){
                db.transaction(callback);
                function callback(tx){
                    //var sql = "select * from storeUp where ownUser = '" + ownUser +"'";
                    var sql = "select id,starInfoId,title,description,message,datetime,userName,headImg,ownUser from storeUp where ownUser = '" + ownUser +"'";
                    tx.executeSql(sql,[],selectStoreUpResult,queryError);
                }
                function queryError(tx,err){
                    console.log(err);
                }
            },
            getStoreUpById : function(storeUpId,selectStoreUpResult){
                db.transaction(callback);
                function callback(tx){
                    //var sql = "select * from storeUp where id = '" + storeUpId + "'";
                    var sql = "select id,starInfoId,title,description,message,datetime,userName,headImg,ownUser from storeUp where id = '" + storeUpId + "'";
                    tx.executeSql(sql,[],selectStoreUpResult,queryError);
                }
                function queryError(tx,err){
                    console.log(err);
                }
            }

        }
    })

    .factory('barcodeScanner', function () {
        return {
            scan: function () {
                window.plugins.barcodeScanner.scan(
                    function (result) {
                        alert("We got a barcode\n" +
                            "Result: " + result.text + "\n" +
                            "Format: " + result.format + "\n" +
                            "Cancelled: " + result.cancelled);
                    },
                    function (error) {
                        console.log("Scanning failed: " + error);
                    }
                );
            }

        }

    })

    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])

    .factory('Fws', ['$resource', function ($resource) {

        return $resource(defaultUrl, null,
            {

                allNewStar: {method: 'GET', url: defaultUrl + 'starList/:pageIndex', cache: false}


            }
        )

    }])
    .factory('Sps', function () {
        var sps = [/*{
         id: 0,
         name: '试错交易基础课程之投资旋涡',
         lastStarInfoTitle: '很多投资者在交易过程中都会陷入到投资',
         headImg: 'img/sp1.png',
         lastStarInfoTime: '2015年2月1日'
         },{
         id: 1,
         name: '试错交易中级课程之投资困境',
         lastStarInfoTitle: '投资困境，长期的交易产生投资困境',
         headImg: 'img/sp2.png',
         lastStarInfoTime: '2015年2月1日'
         },{
         id: 2,
         name: '试错交易高级课程之投资迷宫',
         lastStarInfoTitle: '经过前面的投资旋涡和投资困境学习，我',
         headImg: 'img/sp3.png',
         lastStarInfoTime: '2015年2月1日'
         },{
         id: 3,
         name: '试错交易技术分析之图形分析',
         lastStarInfoTitle: '今天，我们给大家介绍技术分析中的图形',
         headImg: 'img/sp4.png',
         lastStarInfoTime: '2015年2月2日'
         }*/];
        return {
            all: function () {
                return sps;
            },
            remove: function (sp) {
                sps.splice(sps.indexOf(sp), 1);
            },
            get: function (spId) {
                for (var i = 0; i < sps.length; i++) {
                    if (sps[i].id === parseInt(spId)) {
                        return sps[i];
                    }
                }
                return null;
            }
        }
    })
    .factory('Tss', function () {
        var tss = [/*{
         id: 2,
         name: '大趋势单服务',
         description: '大趋势单服务，追踪交易品种的长期趋',
         headImg: 'img/dqsd.png',
         category : '5',
         updateTime: '2015年1月31日'
         }, {
         id: 5,
         name: '趋势单服务',
         description: '趋势单服务，提供趋势交易服务',
         updateTime: '2015年1月31日',
         category : '5',
         headImg: 'img/qsd.png'
         }, {
         id: 6,
         name: '日内交易',
         description: '日内交易服务，以日内短线交易为主',
         updateTime: '2015年1月31日',
         category : '5',
         headImg: 'img/rnd.png'
         }*/];
        return {
            all: function () {
                return tss;
            },
            remove: function (ts) {
                tss.splice(tss.indexOf(ts), 1);
            },
            get: function (tsId) {
                for (var i = 0; i < tss.length; i++) {
                    if (tss[i].id === parseInt(tsId)) {
                        return tss[i];
                    }
                }
                return null;
            }
        }
    })
    .factory('Bgs', function () {
        var bgs = [
            /*{
             id: '18541811-5a58-4343-9f01-fd2cabe1e1ff',
             name: '大趋势单报告PDF',
             description: '大趋势单服务，追踪交易品种的长期趋',
             headImg: 'img/dqsd.png',
             category : '4',
             updateTime: '2015年1月20日'
             }, {
             id: '18541811-5a58-4343-9f01-fd2cabe1e1ff',
             name: '趋势单报告PDF',
             description: '趋势单服务，提供趋势交易服务',
             updateTime: '2015年1月26日',
             category : '4',
             headImg: 'img/qsd.png'
             }, {
             id: '18541811-5a58-4343-9f01-fd2cabe1e1ff',
             name: '日内交易报告PDF',
             description: '日内交易服务，以日内短线交易为主',
             updateTime: '2015年1月30日',
             category : '4',
             headImg: 'img/rnd.png'
             }*/
        ];
        return {
            all: function () {
                return bgs;
            },
            remove: function (bg) {
                bgs.splice(bgs.indexOf(bg), 1);
            },
            get: function (bgId) {
                for (var i = 0; i < bgs.length; i++) {
                    if (bgs[i].id === parseInt(bgId)) {
                        return bgs[i];
                    }
                }
                return null;
            }
        }
    })

    .factory('Lcs', ['$resource', function ($resource) {
        var lcs = [/*{
         id: 0,
         name: '中粮双谱理财',
         lastStarInfoTitle: '中粮双谱理财，进驻2015组合基金前十，年化收',
         headImg: 'img/lc1.png',
         lastStarInfoTime: '2015年2月1日'
         },{
         id: 1,
         name: '中粮策略精选',
         lastStarInfoTitle: '旗下产品历业绩优异，中低风险，中高收益',
         headImg: 'img/lc2.png',
         lastStarInfoTime: '2015年2月1日'
         },{
         id: 2,
         name: '中粮试错交易一号',
         lastStarInfoTitle: '试错交易团队倾力打造高效收益理财产品',
         headImg: 'img/lc3.png',
         lastStarInfoTime: '2015年2月1日'
         }*/];

        return {
            all: function () {
                return lcs;
            },
            remove: function (lc) {
                lcs.splice(lcs.indexOf(lc), 1);
            },
            get: function (lcId) {
                for (var i = 0; i < lcs.length; i++) {
                    if (lcs[i].id === parseInt(lcId)) {
                        return lcs[i];
                    }
                }
                return null;
            }
        }
    }])

    .factory('FwLists', ['$resource', function ($resource) {


        return $resource(defaultUrl, null,
            {

                all: {method: 'GET', url: defaultUrl + 'pushMessageList/:starId/:pageIndex', cache: false},


            }
        )

        /*return {
         all: function() {
         return fwLists;
         },
         remove: function(fwList) {
         .splice(.indexOf(fwList), 1);
         },
         get: function(fwListId) {
         for (var i = 0; i < fwLists.length; i++) {
         if (fwLists[i].id === parseInt(fwListId)) {
         return fwLists[i];
         }
         }
         return null;
         }
         }*/
    }])
    .factory('RemoteService', ['$resource', function ($resource) {
        return $resource(defaultUrl, null,
            {
                loginByPhone : {method : 'get', url : defaultUrl + 'loginByPhone',cache : false},

                futureAccountLogin : {method : 'get', url : defaultUrl + 'futureAccountLogin',cache : false},

                getUserBalanceImage : {method : 'get', url : 'https://'+basicUrl + '/Sns/service/pushInterface/getUserBalanceImage',cache : false},

                getUserPerformanceData : {method : 'get', url : 'https://'+basicUrl + '/Sns/service/pushInterface/getTradeStatisticalResult',cache : false},

                getContractInfo : {method : 'get', url : 'https://'+basicUrl + '/Sns/service/portal/star/getContractInfo',cache : false},

                signConsultContract : {method : 'get', url : 'https://'+basicUrl + '/Sns/service/pushInterface/signConsultContract',cache : false},

                QueryStarPrice : {method : 'get', url : 'https://'+basicUrl  + '/Sns/service/portal/star/getStarPrice',cache : false},

                needAccountLogin : {method : 'get', url : defaultUrl + 'needAccountLogin',cache : false},

                registByPhone : {method : 'get', url : defaultUrl + 'registByPhone',cache : false},

                getCaptchaByPhone : {method : 'get', url : defaultUrl + 'getCaptchaByPhone/:phoneNumber',cache : false},

                addBusinessByUserId : {method : 'get', url : defaultUrl + 'addBusinessByUserId',cache : false},

                removeBusinessByUserId : {method : 'get', url : defaultUrl + 'removeBusinessByUserId',cache : false},

                selectStoreUp : {method : 'GET', url : defaultUrl + 'selectEstarCollection/:pageIndex',cache : false},

                getStoreUpById : {method : 'GET', url : defaultUrl + 'selectEstarCollectionById',cache : false},

                addStoreUp : {method : 'GET', url : defaultUrl + 'addEstarCollection',cache : false},

                deleteStoreUp : {method : 'get',url : defaultUrl + 'deleteEstarCollectionById/:storeUpId',cache : false},

                allTjywy : {method : 'GET', url : defaultUrl + 'userList/1',cache : false},

                sendMessage : {method : 'GET', url : defaultUrl + 'addNewAsk',cache : false},

                reviceMessage : {method : 'GET', url : defaultUrl + 'askAnswerList/1',cache : false},

                updateUserName : {method : 'GET', url : defaultUrl + 'updateUserName',cache : false},

                updateUserAvatar : {method : 'GET', url : defaultUrl + 'updateUserAvatar',cache : false},

                updateUserPassword : {method : 'GET', url : defaultUrl + 'updateUserPassword',cache : false},

                insertUserOpinion : {method : 'GET', url : defaultUrl + 'insertUserOpinion',cache : false},

                checkIsBuy : {method : 'GET', url: defaultUrl + 'StarBuyVerification/:eStarUserId',cache : false},

                getStarInfoById : {method : 'GET', url : defaultUrl + 'getStarInfoById/:starInfoId',cache : false},

                fwdetailImage : {method : 'GET', url : defaultUrl + 'getKLineImage',cache : false},

                updateApp : {method : 'GET', url : defaultUrl + 'checkVersion',cache : false},

                getPhoneVerifyCode : {method : 'GET', url : defaultUrl + 'getPhoneVerifyCode',cache : false},

                findPasswordUpdate : {method : 'GET', url : defaultUrl + 'findPasswordUpdate',cache : false},

                authorizeThird: {method : 'GET', url : defaultUrl + 'authorizeThird',cache : false},

                loginByThirdParty: {method : 'GET', url : defaultUrl + 'loginByThirdParty',cache : false}
            }
        )
    }])

    .factory('Chats', ['$resource', function ($resource) {

        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastStarInfoTitle: 'You on your way?',
            headImg: ''
        }, {
            id: 1,
            name: 'Max Lynx',
            lastStarInfoTitle: 'Hey, it\'s me',
            headImg: ''
        }, {
            id: 2,
            name: 'Andrew Jostlin',
            lastStarInfoTitle: 'Did you get the ice cream?',
            headImg: ''
        }, {
            id: 3,
            name: 'Adam Bradleyson',
            lastStarInfoTitle: 'I should buy a boat',
            headImg: ''
        }, {
            id: 4,
            name: 'Perry Governor',
            lastStarInfoTitle: 'Look at my mukluks!',
            headImg: ''
        }];

        return $resource(defaultUrl, null,
            {
                /*
                 sendMessage : {method : 'get', url : defaultUrl + 'sendMessage'},

                 reviceMessage : {method : 'get', url : defaultUrl + 'reviceMessage/:userId/:lastTime'}*/
            }
        )
    }])
    //程序启动controller
    .controller('startController', ['$ionicPopup', 'BusyService', '$timeout', 'RemoteService', '$localstorage', '$location', '$scope', '$state', '$ionicNavBarDelegate', '$rootScope', '$cordovaNetwork', function ($ionicPopup, BusyService, $timeout, RemoteService, $localstorage, $location, $scope, $state, $ionicNavBarDelegate, $rootScope, $cordovaNetwork) {

        $scope.go = function (state, params) {
            BusyService.hide();
            if (params != '' && params != null && params != 'undefined') {
                if (state == 'tab.fwlist') {
                    $location.path('/tab/fwl/' + params);
                }
            } else {
                $state.go(state);
            }
        };
        $rootScope.canUseOpenAccountModule = false;
        var request = new XMLHttpRequest();
        try {
            request.open('GET', 'https://' + basicUrl + '/Sns/service/pushInterface/canUseOpenAccountModule', false);  // `false` makes the request synchronous
            request.send(null);
        }
        catch (err) {
            console.log("---------------网络连接错误，请重试。");
        }
        if (request.status === 200) {
            var obj = JSON.parse(request.responseText);
            console.log(request.responseText);
            if (obj.return_code == 200 && obj.message == '请求成功!' && obj.useFlag == 0) {
                $rootScope.canUseOpenAccountModule = true;
            }
        }

        //登录超时
        function loginTimeOut() {

            if ($scope.loginResponse == '0') {
                $timeout.cancel($scope.lto);
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: '登录超时，请稍后重试！',
                    conceleText: '确定'
                });
                return false;
            }

        }

        $scope.loginResponse = '0';
        $rootScope.$on('Login:loginTimeOut', function (event, callback) {

            $scope.lto = $timeout(loginTimeOut, 8000);
            $scope.user = $localstorage.getObject('user');
            var loginData = {};
            loginData['phone'] = $scope.user.phone;
            loginData['password'] = $scope.user.password;
            BusyService.show();
            //$scope.lto = $timeout(loginTimeOut,8000);
            //登录成功和失败
            RemoteService.loginByPhone(loginData, function (data) {
                $scope.loginResponse = '1';
                if (data.return_code == '200') {
                    BusyService.hide();
                    $scope.user.businessUserAvatar = data.data.businessUserAvatar;
                    $scope.user.sessionId = data.data.sessionId;
                    $localstorage.setObject('user', $scope.user);
                    if (callback) {
                        callback();
                    }

                } else {
                    BusyService.hide();
                    $state.go('signin');
                    //var alertPopup = $ionicPopup.alert({
                    //    title: '网络设置有误',
                    //    template: '当前网络不可用！',
                    //    okText: '确定'
                    //});
                    //alertPopup.then(function (res) {
                    //    $state.go('signin');
                    //});
                }
            }, function (err) {
                BusyService.hide();
                $scope.loginResponse = '1';
                // var alertPopup =$ionicPopup.alert({
//                     title : '提示',
//                     template : "登录失败，请重试！",
//                     okText : '确定'
//                 });
            });
        });
    }])
    //个人信息里输入昵称保存界面
    .controller('NicenameCtrl', ['$rootScope', 'BusyService', '$state', 'RemoteService', '$localstorage', '$scope', function ($rootScope, BusyService, $state, RemoteService, $localstorage, $scope) {
        $scope.$on('$ionicView.enter', function () {
            $scope.user = $localstorage.getObject('user');
        });

        $scope.updateNicenamess = function (user) {
            var user2 = {};
            user2.sessionId = $localstorage.getObject('user').sessionId;
            user2.name = user.name;
            BusyService.show();
            RemoteService.updateUserName(user2, function (data) {
                BusyService.hide();
                if (data.return_code == '20006') {
                    BusyService.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }
            }, function (err) {
                BusyService.hide();
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: "加载失败，请重试！",
                //    okText: '确定'
                //});
            });
            $localstorage.setObject('user', user);
            $state.go('tab.wo-person');
        }
    }])
    //重新设置密码界面
    .controller('RepasswordCtrl', ['$rootScope', 'BusyService', '$state', 'RemoteService', '$ionicPopup', '$localstorage', '$scope', function ($rootScope, BusyService, $state, RemoteService, $ionicPopup, $localstorage, $scope) {
        var user2 = $localstorage.getObject('user');

        $scope.updateUserPassword = function (user3) {

            if (user3.newPassword != user3.reNewPassword) {
                var alertPopup = $ionicPopup.alert({
                    title: '提示',
                    template: '两次输入的密码不一致，请重新输入！'
                });
                alertPopup.then(function (res) {
                    return false;
                });

            } else {
                //delete user3.reNewPassword;
                //todo  user.newPassword=user.newPassword;
                var user = {};
                angular.copy(user3, user);
                delete user.reNewPassword;
                user.oldPassword = CryptoJS.SHA256(user.oldPassword + "") + "";
                user.newPassword = CryptoJS.SHA256(user.newPassword + "") + "";
                user.sessionId = $localstorage.getObject('user').sessionId;
                BusyService.show('提交中...');
                RemoteService.updateUserPassword(user, function (data) {
                    BusyService.hide();
                    if (data.return_code == '200') {
                        user2.password = user.newPassword;
                        $localstorage.setObject('user', user2);
                        var alertPopup2 = $ionicPopup.alert({
                            title: '提示',
                            template: '密码已修改!'
                        });
                        alertPopup2.then(function (res) {
                            $state.go('tab.wo');
                        });
                    }
                    if (data.return_code == '20004') {
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: '原始密码不正确，请重新输入!'
                        });
                        alertPopup.then(function (res) {
                            delete user3.oldPassword;
                            delete user3.newPassword;
                        });
                    }
                    if (data.return_code == '20006') {
                        BusyService.hide();
                        $scope.$broadcast('scroll.refreshComplete');
                        $rootScope.$broadcast('Login:loginTimeOut');
                    }
                }, function (err) {
                    BusyService.hide();
                    $ionicPopup.alert({
                        title: '提示',
                        template: "加载失败，请重试！",
                        okText: '确定'
                    });
                })
            }
        }
    }])
    //我的个人信息页 头像昵称手机号
    .controller('PersonCtrl', ['$rootScope', '$state', '$localstorage', '$scope', '$ionicActionSheet', function ($rootScope, $state, $localstorage, $scope, $ionicActionSheet) {
        $scope.$on('$ionicView.enter', function () {
            $scope.user = $localstorage.getObject('user');
            if ($scope.user.name != null) {

            } else {
                $scope.user.name = '未设置';
            }
            if ($scope.user.phone != null) {

            } else {
                $scope.user.phone = '未设置';
            }
            $scope.currentUser = $localstorage.getObject($scope.user.id);
            if ($scope.currentUser.avatarUrl != null) {
                $scope.user.avatarUrl = $scope.currentUser.avatarUrl;
            } else {
                $scope.user.avatarUrl = 'img/headicon_new.jpg';
            }

        });

        $scope.headUrl = '';
        function captureSuccess(mediaFiles) {
            var len = mediaFiles.length;
            for (var i = 0; i < len; i++) {
                $scope.user.avatarUrl = mediaFiles[i].fullPath;
                $localstorage.setObject('user', $scope.user);

            }
        }

        function captureError(err) {
            if (CaptureError.CAPTURE_NO_MEDIA_FILES == err.code) {

            } else {
            }
        }

        function onSuccess(imageURI) {
            $scope.user.avatarUrl = imageURI;
            $localstorage.setObject($scope.user.id, {avatarUrl: $scope.user.avatarUrl});
            $localstorage.setObject('user', $scope.user);
            $state.go("tab.wo");


        }

        function onError(message) {
        }

        $scope.showActionSheet = function () {
            $ionicActionSheet.show({
                buttons: [
                    {text: '拍照'},
                    {text: '从手机相册选择'}
                ],
                cancelText: '取消',
                cancel: function () {
                },
                buttonClicked: function (index) {
                    if (index == 0) {


                        var options = {
                            quality: 50,
                            desinationType: Camera.DestinationType.FILE_URI,

                            allowEdit: true
                        }
                        navigator.camera.getPicture(onSuccess, onError, options);
                    }
                    if (index == 1) {
                        var options = {
                            quality: 50,
                            desinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            allowEdit: true
                        }
                        navigator.camera.getPicture(onSuccess, onError, options);
                    }
                    return true;
                }

            });
        };
    }])
    //密码管理页启动重新设置密码界面
    .controller('PasswordCtrl', ['$scope', function ($scope) {

    }])
    //收藏页显示已收藏的列表
    .controller('StoreupCtrl', ['$filter', '$rootScope', 'BusyService', 'RemoteService', '$scope', '$state', '$localstorage', 'webLocalDB', function ($filter, $rootScope, BusyService, RemoteService, $scope, $state, $localstorage, webLocalDB) {
        $scope.isSearch;
        var user2 = $localstorage.getObject('user');
        $scope.myId = user2.id;
        var db = webLocalDB.getDb();

        $scope.goBack = function () {
        };
        //联网删除收藏
        $scope.deletes = function (item) {
            BusyService.show();
            webLocalDB.deleteStoreUp(item.id);
            RemoteService.deleteStoreUp({
                'storeUpId': item.id,
                'sessionId': $localstorage.getObject('user').sessionId
            }, function (data) {
                BusyService.hide();
                if (data.return_code == '20006') {
                    BusyService.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }
            }, function (err) {
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: "加载失败，请重试！",
                    okText: '确定'
                });
            });
            for (var i = 0; i < $scope.items.length; i++) {
                var m = $scope.items[i];
                if (item.id == m.id) {
                    $scope.items.splice(i, 1);
                    break;
                }
            }
        }

        $scope.label = function (item) {
        }
        //ng-model="query" ng-change="search(query)"本地查询符合的收藏
        $scope.search = function (item) {
            $scope.isSearch = '1';
            webLocalDB.searchStoreUp(item, $scope.myId, selectStoreUpResult);
        }
        function selectStoreUpResult(tx, result) {
            var rowList = result.rows;
            if ($scope.isSearch == '1') {
                $scope.items = [];
            }

            for (var i = 0; i < rowList.length; i++) {
                var row = rowList.item(i);
                var storeUp = {};
                for (var j in row) {
                    storeUp[j] = row[j];
                }
                if ($scope.isSearch == '1') {
                    $scope.items.push(storeUp);
                } else {
                    if ($scope.items.length != 0) {
                        var isContain = false;
                        for (var k = 0; k < $scope.items.length; k++) {
                            if ($scope.items[k].id == storeUp.id) {
                                isContain = true;
                                break;
                            }
                        }
                        if (!isContain) {
                            $scope.items.push(storeUp);
                        }
                    } else {
                        $scope.items.push(storeUp);
                    }
                }

            }
        }

        $scope.addStoreup = function (item) {
            $state.go('wo-storeup-add');

        }
        /*db.transaction(callback);
         function callback(tx){
         var sql = "select * from storeUp where ownUser = ?";
         tx.executeSql(sql,[$scope.myId],selectStoreUpResult,queryError);
         }*/

        //供下面调用
        function selectStoreUp() {
            webLocalDB.selectStoreUp($scope.myId, selectStoreUpResult);
        }

        $scope.pageIndex = 1;
        $scope.$on('$ionicView.enter', function () {
            BusyService.show();

            //网上查询收藏数据存到本地数据库
            RemoteService.selectStoreUp({
                pageIndex: $scope.pageIndex,
                sessionId: $localstorage.getObject('user').sessionId
            }, function (data) {
                BusyService.hide();
                if (data.return_code == '200') {
                    var result = data.data;
                    for (var i = 0; i < result.length; i++) {
                        result[i].ownUser = user2.id.toString();
                        result[i].datetime = $filter('date')(result[i].collectionTime, 'yyyy年MM月dd日 HH:mm:ss');
                        result[i].headImg = "";
                        result[i].starInfoId = "";
                        webLocalDB.insertStoreUp(result[i]);
                    }
                    if (result.length == 20) {
                        $scope.pageIndex += 1;
                    }
                }
                if (data.return_code == '20006') {
                    BusyService.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }
            }, function (err) {
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: "加载失败，请重试！",
                    okText: '确定'
                });
            });
            $scope.isSearch = '0';
            selectStoreUp();
        });
        $scope.items = [];

    }])
    //从本地数据库拿到收藏信息
    .controller('StoreupContentCtrl', ['$filter', '$rootScope', '$timeout', '$scope', '$stateParams', '$localstorage', 'webLocalDB', 'StoreUp', function ($filter, $rootScope, $timeout, $scope, $stateParams, $localstorage, webLocalDB, StoreUp) {
        var user2 = $localstorage.getObject('user');
        var db = webLocalDB.getDb();
        $scope.myId = user2.id;
        /*RemoteService.getById({'storeUpId' : $stateParams.storeUpId},function(data){
         if(data.return_code == '200'){
         $scope.content= data.data;
         }
         });*/
        function selectStoreUpResult(tx, result) {
            var rowList = result.rows;
            for (var i = 0; i < rowList.length; i++) {
                var row = rowList.item(i);
                var storeUp = {};
                for (var j in row) {
                    if (j == 'id') {
                        storeUp.id = row[j];
                    }
                    if (j == 'title') {
                        storeUp.title = row[j];
                    }
                    if (j == 'message') {
                        storeUp.message = row[j];
                    }
                    if (j == 'time') {
                        storeUp.title = row[j];
                    }
                    if (j == 'description') {
                        storeUp.description = row[j];
                    }
                    if (j == 'userName') {
                        storeUp.userName = row[j];
                    }
                    if (j == 'headImg') {
                        storeUp.headImg = row[j];
                    }
                    if (j == 'datetime') {
                        storeUp.datetime = row[j];
                    }
                }
                $scope.content = storeUp;
            }
        }

        /*db.transaction(callback);
         function callback(tx){
         var sql = "select * from storeUp where id = ?";
         tx.executeSql(sql,[$stateParams.storeUpId],selectStoreUpResult,queryError);
         }*/

        webLocalDB.getStoreUpById($stateParams.storeUpId, selectStoreUpResult);


        /*$scope.$on('$ionicView.enter',function(){
         selectStoreUp();
         });*/


        $scope.content = {};
    }])

    //增加收藏的功能
    .controller('StoreupAddCtrl', ['$rootScope', '$ionicPopup', 'BusyService', 'RemoteService', '$scope', 'webLocalDB', 'StoreUp', '$localstorage', 'UUIDFac', '$state', '$filter', function ($rootScope, $ionicPopup, BusyService, RemoteService, $scope, webLocalDB, StoreUp, $localstorage, UUIDFac, $state, $filter) {
        var user2 = $localstorage.getObject('user');
        var username = user2.phone;
        var myId = user2.id;
        var headImg = user2.headImg;
        $scope.addStoreWenZi = function () {
            BusyService.show('增加收藏中，请稍后...');
            var storeUp = {};
            storeUp.id = UUIDFac.getUUID().id;
            storeUp.starInfoId
            storeUp.userName = username;
            storeUp.description
            storeUp.name = '文字 ' + $filter('date')(new Date(), 'yyyy年MM月dd日');
            storeUp.userId = $localstorage.getObject('user').id;
            storeUp.sessionId = $localstorage.getObject('user').sessionId;
            storeUp.headImg = headImg;
            storeUp.content = $scope.item;
            var now = new Date().getTime();
            storeUp.datetime = $filter('date')(new Date(), 'yyyy年MM月dd日');
            webLocalDB.insertStoreUp(storeUp);
            RemoteService.addStoreUp(storeUp, function (data) {
                if (data.return_code == '200') {
                    BusyService.hide();
                    $scope.alertPopup = $ionicPopup.alert({
                        title: "提示",
                        template: "收藏成功！"
                    });
                }
                if (data.return_code == '20006') {
                    BusyService.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }
            }, function (err) {
                BusyService.hide();
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: "加载失败，请重试！",
                //    okText: '确定'
                //});
            });
            $scope.alertPopup.then(function (res) {
                $state.go('wo-storeup');
            });
        }

        $scope.item = {
            content: ''
        };
    }])
    //业务员信息页
    .controller('BuserCtrl', ['$rootScope', 'BusyService', 'webLocalDB', '$state', '$ionicPopup', 'RemoteService', '$localstorage', '$scope', function ($rootScope, BusyService, webLocalDB, $state, $ionicPopup, RemoteService, $localstorage, $scope) {
        var user2 = $localstorage.getObject('user');
        var businessUserId = user2.businessUserId;
        $scope.buser = user2;
        $scope.myId = user2.id;
        //var  userFrontId=userId;
        //alert(userId+"~~");
        $scope.businessUserName = user2.businessUserName;
        if (businessUserId) {
            $scope.businessUserFlag = true;

        } else {
            $scope.businessUserFlag = false;
        }
        $scope.$on('$ionicView.afterEnter', function () {
            var user2 = $localstorage.getObject('user');
            var businessUserId = user2.businessUserId;
            $scope.buser = user2;
            $scope.myId = user2.id;
            $scope.businessUserName = user2.businessUserName;
            if (businessUserId) {
                $scope.businessUserFlag = true;

            } else {
                $scope.businessUserFlag = false;
            }

        });
        $scope.scan22 = function () {
            //二维码扫描绑定业务员，成功后联网获取所有星星
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    var userBindInfo = {};
                    userBindInfo['sessionId'] = $localstorage.getObject('user').sessionId;
                    userBindInfo['businessUserId'] = result.text;
                    RemoteService.addBusinessByUserId(userBindInfo, function (data) {
                        if (data.return_code == '200') {
                            $scope.businessUserFlag = true;
                            $scope.businessUserName = data.data.businessUserName;
                            $scope.businessUserAvatar = data.data.businessUserAvatar;
                            user2.businessUserId = data.data.businessUserId;
                            user2.businessUserName = data.data.businessUserName;
                            user2.businessUserAvatar = data.data.businessUserAvatar;
                            user2.isActivation = data.data.isActivation;
                            user2.sessionId = data.data.sessionId;
                            user2.id = data.data.id;
                            $localstorage.setObject('user', user2);
                            var chatUser = {
                                userId: user2.businessUserId.toString(),
                                badge: 0,
                                lastMessage: '',
                                lastTime: '',
                                ownUser: user2.id.toString()
                            };
                            webLocalDB.insertChatUser(chatUser);
                            //远程获取星星包
                            Fws.allNewStar({
                                    pageIndex: 1,
                                    sessionId: $localstorage.getObject('user').sessionId
                                }, function (data) {
                                    BusyService.hide();
                                    if (data.return_code == '200') {
                                        var result = data.data;
                                        for (var i = 0; i < fwsdefault.length; i++) {
                                            result.push(fwsdefault[i]);
                                        }
                                        $scope.fws = result;

                                    }
                                    if (data.return_code == '20006') {
                                        BusyService.hide();
                                        $scope.$broadcast('scroll.refreshComplete');
                                        $rootScope.$broadcast('Login:loginTimeOut');
                                    }
                                    $ionicPopup.alert({
                                        title: '提示',
                                        template: '绑定成功！',
                                        okText: '确定'
                                    });
                                }
                            );

                        }
                        if (data.return_code == '20006') {
                            BusyService.hide();
                            $scope.$broadcast('scroll.refreshComplete');
                            $rootScope.$broadcast('Login:loginTimeOut');
                        }

                    }, function (err) {
                        BusyService.hide();
//                        $ionicPopup.alert({
//                            title : '提示',
//                            template : "加载失败，请重试！",
//                            okText : '确定'
//                        });
                    })
                },
                function (error) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: error,
                        okText: '确定'
                    });

                }
            );
        }

        //解除绑定
        $scope.unbind = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '解绑后，您将不能继续接受业务员的信息，您确定与业务员解绑吗?',
                okText: '确定',
                cancelText: '取消'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    BusyService.show("解绑中...");
                    RemoteService.removeBusinessByUserId({'sessionId': $localstorage.getObject('user').sessionId}, function (data) {
                        user2.businessUserId = '';
                        user2.businessUserName = '';
                        user2.businessUserAvatar = '';
                        $localstorage.setObject('user', user2);
                        webLocalDB.deleteChatUser($scope.myId);
                        $scope.buserFlag = false;
                        BusyService.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: '解绑成功！',
                            okText: '确定'
                        });
                        alertPopup.then(function (res) {
                            $state.go('tab.fw');
                        });
                        if (data.return_code == '20006') {
                            BusyService.hide();
                            $scope.$broadcast('scroll.refreshComplete');
                            $rootScope.$broadcast('Login:loginTimeOut');
                        }
                    }, function (err) {
                        BusyService.hide();
                        $ionicPopup.alert({
                            title: '提示',
                            template: "加载失败，请重试！",
                            okText: '确定'
                        });
                    });
                } else {
                }
            });


        }
    }])
    //我里的设置退出页
    .controller('SettingCtrl', ['$interval', '$rootScope', '$ionicPopup', 'LastTime', '$localstorage', '$state', '$scope', function ($interval, $rootScope, $ionicPopup, LastTime, $localstorage, $state, $scope) {
        var user = $localstorage.getObject('user');

        $scope.logout = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '您确定退出登录吗？',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    if (angular.isDefined($rootScope.stopChat)) {
                        $interval.cancel($rootScope.stopChat);
                        $rootScope.stopChat = undefined;
                    }
                    if (angular.isDefined($rootScope.stop)) {
                        $interval.cancel($rootScope.stop);
                        $rootScope.stop = undefined;
                    }
                    $localstorage.set('user', '');
                    //todo列表清空
                    $rootScope.isChangeUser = true;
                    LastTime.setExitTime();
                    LastTime.setRequestTime();
                    LastTime.setLastChatTime();
                    isVisitor = true;
                    $state.go('signin');
                } else {
                }
            });

        }
    }])
    //设置里的关于
    .controller('SettingAboutCtrl', ['$scope', function ($scope) {

    }])
    //网络提交意见
    .controller('SettingOpinionCtrl', ['$rootScope', 'BusyService', '$ionicPopup', 'RemoteService', '$state', '$localstorage', '$scope', function ($rootScope, BusyService, $ionicPopup, RemoteService, $state, $localstorage, $scope) {
        $scope.opinion = {
            content: '',
            contact: '',
            userInfoId: ''
        }
        var user = $localstorage.getObject('user');
        $scope.opinion.sessionId = $localstorage.getObject('user').sessionId;
        $scope.saveOpinion = function (opinion) {
            BusyService.show("提交中，请稍后...");
            RemoteService.insertUserOpinion($scope.opinion, function (data) {
                BusyService.hide();
                if (data.return_code == '200') {
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '您的意见已经提交，感谢您对产品的支持！',
                        okText: '确定'
                    });
                    alertPopup.then(function (res) {
                        $state.go('tab.wo-setting');
                    });
                }
                if (data.return_code == '20006') {
                    BusyService.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }
            }, function (err) {
                BusyService.hide();
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: "加载失败，请重试！",
                //    okText: '确定'
                //});
            });

        }

    }])
    //主页面下的主页，聊天，开户，我Tab
    .controller('FwTabCtrl', ['$scope', '$ionicTabsDelegate', function ($scope, $ionicTabsDelegate) {
        $scope.fwBadge = 0;
        $scope.$on('fwTabUnReadCount', function (d, data) {
            $scope.fwBadge = data;
        });
        $scope.f_fwSelect = function () {


        }
        $scope.f_fwDeselect = function () {
        }
    }])

    //开户tab
    .controller('KhTabCtrl', ['$scope', '$rootScope', '$state', '$ionicTabsDelegate', function ($scope, $rootScope, $state, $ionicTabsDelegate) {
        //fix bug ngclick fire twice at the app start

        window.lock = 0;
        $scope.zlkh = function () {
            if ($rootScope.canUseOpenAccountModule) {
                if (window.lock == 0) {
                    window.lock = 1;
                    window.openAccount.presentOAC(function () {
                    }, function () {
                    }, []);
                    setTimeout("window.lock = 0;", 1000);
                }
            } else {
                $state.go('tab.kh');
            }
        }


    }])
    //登录账户密码页
    .controller('SignInCtrl', ['$rootScope', 'JpushService', 'webLocalDB', '$timeout', '$filter', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$cordovaNetwork', function ($rootScope, JpushService, webLocalDB, $timeout, $filter, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $cordovaNetwork) {
        var user2 = $localstorage.getObject('user');
        var username = user2.phone;
        var password = user2.password;
        var openid = user2.openid;
        var expiresDate = user2.expiresDate;
        var type = user2.type;
        $scope.zlkh = function () {
            window.openAccount.presentOAC(function () {
            }, function () {
            }, []);
        };
        $scope.canUseOpenAccountModule = $rootScope.canUseOpenAccountModule;
        $scope.loginResponse = '0';

        $scope.signIn = function (user3) {

            var netType = $cordovaNetwork.getNetwork();
            if (netType == 'none') {
                $ionicPopup.alert({
                    title: '网络设置有误',
                    template: '当前网络不可用！',
                    okText: '确定'
                });
                return false;

            } else {


                if (user3 == undefined || user3.phone == undefined || user3.phone == null || user3.phone == "" || user3.password == undefined || user3.password == null || user3.password == "") {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '手机号或密码不能为空！',
                        okText: '确定'
                    });
                    return false;
                } else {

                }

            }
            BusyService.show('登陆中...');
            $scope.lto = $timeout(loginTimeOut, 8000);
            //todo  user.password=user.password;
            var user = {};
            angular.copy(user3, user);
            user.password = CryptoJS.SHA256(user.password + "") + "";
            RemoteService.loginByPhone(user, function (data) {
                $scope.loginResponse = '1';
                BusyService.hide();
                if (data.return_code == '200') {
                    isVisitor = false;
                    user.businessUserId = data.data.businessUserId;
                    user.businessUserName = data.data.businessUserName;
                    user.businessUserAvatar = data.data.businessUserAvatar;
                    user.isActivation = data.data.isActivation;
                    user.sessionId = data.data.sessionId;
                    user.id = data.data.id;
                    user.name = data.data.name;
                    user.avatarUrl = data.data.avatarUrl;

                    $localstorage.setObject('user', '');
                    $localstorage.setObject('user', user);
                    webLocalDB.deleteChatUser(user.id);
                    var chatUser = {
                        userId: user.businessUserId,
                        badge: 0,
                        lastMessage: '',
                        lastTime: '',
                        ownUser: user.id
                    };
                    webLocalDB.insertChatUser(chatUser);

                    // alert($localstorage.getObject('user').id+"~");
                    $state.go('tab.fw');
                } else {

                    $ionicPopup.alert({
                        title: '提示',
                        template: '用户名或密码错误',
                        okText: '确定'
                    });
                }
            }, function (err) {
                BusyService.hide();
                $scope.loginResponse = '1';
                $ionicPopup.alert({
                    title: '提示',
                    template: '用户名或密码错误',
                    okText: '确定'
                });
            });

        }
        function loginTimeOut() {

            if ($scope.loginResponse == '0') {
                // $timeout.cancel($scope.lto);
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: '登录超时，请稍后重试！',
                    cancelText: '确定'
                });
                return false;
            }

        }

        $scope.thirdLogin = function (type){
            var loginData = {};
            if(type == 1) {
                window.thirdLoginPlugin.wechatLogin(function(data) {
                    RemoteService.authorizeThird({code: data}, function(authData) {
                        if(authData.return_code == 200) {
                            loginData.openid = authData.data.phone;
                            loginData.type = 1;
                            loginByThirdParty(loginData);
                        }
                    }, function() {

                    });
                },function() {

                },[])
            } else if (type == 2) {
                window.thirdLoginPlugin.qqLogin(function(data){
                    loginData.openid = data.openid;
                    loginData.type = 2;
                    loginData.accessToken = data.accessToken;
                    loginData.expireDate = data.expiresIn;
                    loginData.userInfo = JSON.stringify(data.userInfo);
                    loginByThirdParty(loginData);
                },function(){

                },[])
            }
        }

        function loginByThirdParty(loginData) {

            BusyService.show('登陆中...');
            RemoteService.loginByThirdParty(loginData,function(data){

                $scope.loginResponse = '1';
                if(data.return_code == '200'){
                    BusyService.hide();
                    //user2.businessUserAvatar = data.data.businessUserAvatar;
                    //user2.sessionId = data.data.sessionId;
                    isVisitor = false;
                    var   user={};
                    user.openid = loginData.openid;
                    user.type = loginData.type;
                    var myDate = new Date();
                    //微信refresh_token过期时间30天，qq的access_token过期是三个月
                    if(user.type == 1) {
                        myDate.setDate(myDate.getDate()+30);
                    }else {
                        myDate.setMonth(myDate.getMonth()+3);
                    }
                    user.expiresDate = Number(myDate.toISOString().substring(0, 10).replace(/-/g,''));
                    user.businessUserId = data.data.businessUserId;
                    user.businessUserName = data.data.businessUserName;
                    user.businessUserAvatar = data.data.businessUserAvatar;
                    user.isActivation = data.data.isActivation;
                    user.sessionId = data.data.sessionId;
                    user.id = data.data.id;
                    user.name = data.data.name;
                    user.avatarUrl = data.data.avatarUrl;

                    $localstorage.setObject('user','');
                    $localstorage.setObject('user',user);
                    //alert(data.data.sessionId+":"+data.data.id);
                    //$localstorage.setObject('user',user2);
                    $state.go('tab.fw');
                }else{
                    BusyService.hide();
                    $ionicPopup.alert({
                        title : '提示',
                        template : data.message,
                        okText : '确定'
                    });
                }
            },function(err){
                BusyService.hide();
                $scope.loginResponse = '1';
                $ionicPopup.alert({
                    title : '提示',
                    template : "登录失败，请重试！",
                    okText : '确定'
                });
            });
        }
        var isThirdParty = false;
        if(openid != undefined) {
            var date = Number(new Date().toISOString().substring(0, 10).replace(/-/g,''));
            if(date < expiresDate) {
                isThirdParty = true;
            }else {
                document.addEventListener("deviceready", function() {
                    $scope.thirdLogin(type);
                }, false);
            }
        }else if(username == undefined) {
            username = visitor;
            password = CryptoJS.SHA256(visitorPW) + "";
            isVisitor = true;
        }else if(username == "721519201234"){
            isVisitor = true;
        }
        if(isThirdParty) {
            BusyService.show('登陆中...');
            loginData = {};
            loginData.openid = openid;
            loginData.type = type;
            RemoteService.loginByThirdParty(loginData,function(data){

                $scope.loginResponse = '1';
                if(data.return_code == '200'){
                    BusyService.hide();
                    //user2.businessUserAvatar = data.data.businessUserAvatar;
                    //user2.sessionId = data.data.sessionId;
                    isVisitor = false;
                    var   user={};
                    user.openid = openid;
                    user.type = type;
                    user.expiresDate = expiresDate;
                    user.businessUserId = data.data.businessUserId;
                    user.businessUserName = data.data.businessUserName;
                    user.businessUserAvatar = data.data.businessUserAvatar;
                    user.isActivation = data.data.isActivation;
                    user.sessionId = data.data.sessionId;
                    user.id = data.data.id;
                    user.name = data.data.name;
                    user.avatarUrl = data.data.avatarUrl;

                    $localstorage.setObject('user','');
                    $localstorage.setObject('user',user);
                    //alert(data.data.sessionId+":"+data.data.id);
                    //$localstorage.setObject('user',user2);
                    $state.go('tab.fw');
                }else{
                    BusyService.hide();
                    $ionicPopup.alert({
                        title : '提示',
                        template : data.message,
                        okText : '确定'
                    });
                }
            },function(err){
                BusyService.hide();
                $scope.loginResponse = '1';
                $ionicPopup.alert({
                    title : '提示',
                    template : "登录失败，请重试！",
                    okText : '确定'
                });
            });
        }else {
            if (angular.isString(username) && angular.isString(password)) {
                var loginData = {};
                loginData['phone'] = username;
                loginData['password'] = password;
                BusyService.show('登陆中...');
                $scope.lto = $timeout(loginTimeOut, 8000);

                RemoteService.loginByPhone(loginData, function (data) {

                    $scope.loginResponse = '1';
                    if (data.return_code == '200') {
                        BusyService.hide();
                        //user2.businessUserAvatar = data.data.businessUserAvatar;
                        //user2.sessionId = data.data.sessionId;
                        var user = {};
                        user.phone = username;
                        user.password = password;
                        user.businessUserId = data.data.businessUserId;
                        user.businessUserName = data.data.businessUserName;
                        user.businessUserAvatar = data.data.businessUserAvatar;
                        user.isActivation = data.data.isActivation;
                        user.sessionId = data.data.sessionId;
                        user.id = data.data.id;
                        user.name = data.data.name;
                        user.avatarUrl = data.data.avatarUrl;

                        $localstorage.setObject('user', '');
                        $localstorage.setObject('user', user);
                        //alert(data.data.sessionId+":"+data.data.id);
                        //$localstorage.setObject('user',user2);
                        $state.go('tab.fw');
                    } else {
                        BusyService.hide();
                        $ionicPopup.alert({
                            title: '提示',
                            template: data.message,
                            okText: '确定'
                        });
                    }
                }, function (err) {
                    BusyService.hide();
                    $scope.loginResponse = '1';
                    $ionicPopup.alert({
                        title: '提示',
                        template: "登录失败，请重试！",
                        okText: '确定'
                    });
                });


            } else {
            }
        }

    }])



    //资金账号登录
    .controller('AccountInCtrl', ['$rootScope', 'JpushService', 'webLocalDB', '$timeout', '$filter', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$location', '$stateParams', function ($rootScope, JpushService, webLocalDB, $timeout, $filter, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $location, $stateParams) {
        var user2 = $localstorage.getObject('account');
        $scope.account = {"type": "0"};
        $scope.canUseOpenAccountModule = $rootScope.canUseOpenAccountModule;

        var username = user2.phone;
        var password = user2.password;
        var paramId = $stateParams.paramId;

        $scope.zlkh = function () {
            window.openAccount.presentOAC(function () {
            }, function () {
            }, []);
        };

        $scope.loginResponse = '0';
        $scope.signIn = function (user3) {
             if (user3 == undefined || user3.phone == undefined || user3.phone == null || user3.phone == "" || user3.password == undefined || user3.password == null || user3.password == "") {
                 $ionicPopup.alert({
                     title: '提示',
                     template: '资金账号或密码不能为空！',
                     okText: '确定'
                 });
                 return false;
             } else {

             }
//			if (user3 == undefined) {
//                $ionicPopup.alert({
//                    title: '提示',
//                    template: "资金账号和密码不能为空！",
//                    okText: '确定'
//                });
//                return false;
//            }
//            if (user3.phone == undefined) {
//                $ionicPopup.alert({
//                    title: '提示',
//                    template: "资金账号不能为空！",
//                    okText: '确定'
//                });
//                return false;
//            } else {
//            }
//            if (user3.password == undefined) {
//                $ionicPopup.alert({
//                    title: '提示',
//                    template: "密码不能为空！",
//                    okText: '确定'
//                });
//                return false;
//
//            }

            var user = {
                account: user3.phone,
                password: user3.password,
                type: user3.type
            }

            BusyService.show('登陆中...');
            $scope.lto = $timeout(loginTimeOut, 8000);
            RemoteService.futureAccountLogin(user, function (data) {
                $scope.loginResponse = '1';
                BusyService.hide();
                if (data.return_code == '200' && data.loginresult == 0) {
//                   if (data.return_code == '200') {
                    isAccountLogin = true;
                    zjAccount = user.account;
                    zjPassword = user.password;
                    type = user.type;
                    if(paramId == '1') {
                        $location.path('/balanceParams');
                    }else if(paramId == '2') {
                        $location.path('/performanceParams');
                    }else {
                        $location.path('/pd');
                    }
//                    $state.go('tab.fw');
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: "登录失败。请检查您的登录系统、资金账号、密码是否正确。",
                        okText: '确定'
                    });
                }
            }, function (err) {
                BusyService.hide();
                $scope.loginResponse = '1';
                $ionicPopup.alert({
                    title: '提示',
                    template: "登录失败。请检查您的登录系统、资金账号、密码是否正确。",
                    okText: '确定'
                });
            });
        }
        function loginTimeOut() {

            if ($scope.loginResponse == '0') {
                // $timeout.cancel($scope.lto);
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: '登录超时，请稍后重试！',
                    cancelText: '确定'
                });
                return false;
            }

        }


    }])
    //查看业绩参数设置
    .controller('performanceParamsCtrl',['$rootScope','JpushService','webLocalDB','$timeout','$filter','BusyService','$scope','$state','$localstorage','$ionicPopup','RemoteService','$location','$stateParams',function($rootScope,JpushService,webLocalDB,$timeout,$filter,BusyService,$scope,$state,$localstorage,$ionicPopup,RemoteService,$location,$stateParams){

        $scope.loginResponse = '0';
        $scope.confirm = function(params){
            if(params == undefined){
                $ionicPopup.alert({
                    title : '提示',
                    template : "开始日期和结束日期不能为空！",
                    okText : '确定'
                });
                return false;
            }

            if(params.startday == undefined){
                $ionicPopup.alert({
                    title : '提示',
                    template : "请设置开始日期",
                    okText : '确定'
                });
                return false;
            }

            if(params.endday == undefined){
                $ionicPopup.alert({
                    title : '提示',
                    template : "请设置结束日期",
                    okText : '确定'
                });
                return false;
            }
			//查询延后一天
            var startday = Number(params.startday.toISOString().substring(0, 10).replace(/-/g,''))+1;
            var endday = Number(params.endday.toISOString().substring(0, 10).replace(/-/g,''))+1;
            console.log("----------start day is: " + startday);
            console.log("----------end day is: " + endday);

            var user ={
                account: zjAccount,
                start: startday,
                end: endday
            }

            BusyService.show('查询中...');
            $scope.lto = $timeout(loginTimeOut,8000);
            RemoteService.getUserPerformanceData(user,function(data){
                $scope.loginResponse = '1';
                BusyService.hide();
                if(data.return_code == '200'){

                    performanceData = data.data;
                    $location.path('/performanceTable');
                }else {
                    $ionicPopup.alert({
                        title : '提示',
                        template : "查询失败",
                        okText : '确定'
                    });
                }
            },function(err){
                BusyService.hide();

                if($scope.loginResponse == '0') {
                    $ionicPopup.alert({
                        title : '提示',
                        template : "查询失败，请重试！",
                        okText : '确定'
                    });
                    $scope.loginResponse = '1';
                }

            });
        }
        function loginTimeOut(){

            if($scope.loginResponse == '0'){
                // $timeout.cancel($scope.lto);
                BusyService.hide();
                $ionicPopup.alert({
                    title : '提示',
                    template : '查询超时，请稍后重试！',
                    cancelText : '确定'
                });
                return false;
                $scope.loginResponse == '1';
            }

        }


    }])
    //查看交易业绩
    .controller('performanceTableCtrl',['$rootScope','JpushService','webLocalDB','$timeout','$filter','BusyService','$scope','$state','$localstorage','$ionicPopup','RemoteService','$location','$stateParams',function($rootScope,JpushService,webLocalDB,$timeout,$filter,BusyService,$scope,$state,$localstorage,$ionicPopup,RemoteService,$location,$stateParams){

        $rootScope.data = performanceData;

    }])
    //查看权益参数设置
    .controller('balanceParamsCtrl', ['$rootScope', 'JpushService', 'webLocalDB', '$timeout', '$filter', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$location', '$stateParams', function ($rootScope, JpushService, webLocalDB, $timeout, $filter, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $location, $stateParams) {

        $scope.params = {"days": 20};
        $scope.loginResponse = '0';
        $scope.confirm = function () {
            var reg = /\d+/;
            if (!reg.test($scope.params.days)) {
                $ionicPopup.alert({
                    title: '提示',
                    template: "请输入正确的天数格式",
                    okText: '确定'
                });
                return false;
            }

            var user = {
                account: zjAccount,
                password: zjPassword,
                days: $scope.params.days,
                type: type
            }

            BusyService.show('查询中...');
            $scope.lto = $timeout(loginTimeOut, 8000);
            RemoteService.getUserBalanceImage(user, function (data) {
                $scope.loginResponse = '1';
                BusyService.hide();
                if (data.return_code == '200') {

                    //console.log(JSON.parse(data));
                    chartUrl = data.url;
                    chartData = data.data;
                    $location.path('/balanceChart');
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: "查询失败",
                        okText: '确定'
                    });
                }
            }, function (err) {
                BusyService.hide();
                $scope.loginResponse = '1';
                $ionicPopup.alert({
                    title: '提示',
                    template: "查询失败，请重试！",
                    okText: '确定'
                });
            });
        }
        function loginTimeOut() {

            if ($scope.loginResponse == '0') {
                // $timeout.cancel($scope.lto);
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: '查询超时，请稍后重试！',
                    cancelText: '确定'
                });
                return false;
            }

        }


    }])

    //查看权益图
    .controller('balanceChartCtrl', ['$rootScope', 'JpushService', 'webLocalDB', '$timeout', '$filter', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$location', '$stateParams', function ($rootScope, JpushService, webLocalDB, $timeout, $filter, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $location, $stateParams) {
        $scope.chartData = chartData;
        $scope.image = {"src": chartUrl};
        $scope.round = function(num) {
            return Number.prototype.toFixed.call(num/10000,2);
        }

    }])

    //购买界面
    .controller('pdlCtrl', ['$rootScope', 'JpushService', 'webLocalDB', '$timeout', '$filter', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$location', '$stateParams', function ($rootScope, JpushService, webLocalDB, $timeout, $filter, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $location, $stateParams) {

        var param1 = {
            months: 0,
            starId: temp.starId
        };
        //价格列表信息也加入到$rootScope中，这样在合同签完之后可以用。
        $rootScope.priceList = $scope.priceList = [];

        var productPrice = temp.price;

        RemoteService.QueryStarPrice(param1, function (data) {
            //BusyService.hide();
            if (data.message == 'SUCESS' && data.return_code == 0) {
                var datas = data.data;
                for (var i = 0; i < datas.length; i++) {
                    var obj = {
                        order: i,
                        months: datas[i].months,
                        price: datas[i].price,
                        iapPriceId: datas[i].iapPriceId,
                        originalPrice: datas[i].months * productPrice
                    }
                    $scope.priceList.push(obj);
                }

            } else {
                $ionicPopup.alert({
                    title: '提示',
                    template: "价格列表加载失败",
                    okText: '确定'
                });
            }
        }, function (err) {
            BusyService.hide();
            $scope.loginResponse = '1';
            $ionicPopup.alert({
                title: '提示',
                template: "价格列表加载失败",
                okText: '确定'
            });
        });

        //var params = {
        //    category: 0,
        //    starId: "31441328fbaf4a758e8e78040e96cd4e",
        //    months: 6,
        //    userId: 61
        //}

        var needSignContracts = false;
        $scope.nextStep = function (order) {
            //点击了第几个购买项。
            $rootScope.order = order;

            var params = {
                category: 0,
                starId: temp.starId,
                months: $scope.priceList[order].months,
                userId: temp.userId
            }
            console.dir(params);

            RemoteService.getContractInfo(params, function (data) {
                //BusyService.hide();
                if (data.return_code == '0' && data.message == 'SUCESS') {
                    needSignContracts = data.needSignContract == 1 ? true : false;
                    if (needSignContracts) {
                        $rootScope.contracts = data.data;
                        $location.path('/contracts/0');
                    } else {
                        window.justPay.getStarInfo(
                            function (results) {
                                //  alert("ok"+results);
                            }, function (error) {
                                alert('Error: ' + error);
                            }, [temp.eStarUserId, temp.userId, temp.starname, temp.description, temp.price, $scope.priceList[order].months, $scope.priceList[order].price, $scope.priceList[order].iapPriceId, PayServerIp]
                        );
                        $state.go('tab.fw');
                    }
                    //console.dir(data.data);
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: "合同加载失败",
                        okText: '确定'
                    });
                }
            }, function (err) {
                BusyService.hide();
                $scope.loginResponse = '1';
                $ionicPopup.alert({
                    title: '提示',
                    template: "合同加载失败",
                    okText: '确定'
                });
            });
        }

    }])
    //合同界面
    .controller('conCtrl', ['$rootScope', 'JpushService', 'webLocalDB', '$timeout', '$filter', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$location', '$stateParams', function ($rootScope, JpushService, webLocalDB, $timeout, $filter, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $location, $stateParams) {

        $scope.agreeCheck = false;

        $scope.i = $stateParams.conId ? $stateParams.conId : 0;

        $scope.title = $rootScope.contracts[$scope.i].name;
        $scope.content = $rootScope.contracts[$scope.i].content;
        $scope.agreement = $rootScope.contracts[$scope.i].agreement;

        $scope.nextStep = function () {

            if (++$scope.i < $rootScope.contracts.length) {
                $location.path('/contracts/' + $scope.i);
            } else {
                var signData = {
                    userId: temp.userId,
                    starId: temp.starId,
                    months: $rootScope.priceList[$rootScope.order].months
                };
                RemoteService.signConsultContract(signData, function (data) {
                    BusyService.hide();
                    if (data.return_code == '0') {
                        window.justPay.getStarInfo(
                            function (results) {
                                //  alert("ok"+results);
                            }, function (error) {
                                // alert('Error: ' + error);
                            }, [temp.eStarUserId, temp.userId, temp.starname, temp.description, temp.price, $rootScope.priceList[$rootScope.order].months, $rootScope.priceList[$rootScope.order].price, $rootScope.priceList[$rootScope.order].iapPriceId, PayServerIp]
                        );

                        $state.go('tab.fw');
                    }
                }, function (err) {
                    BusyService.hide();

                });
            }
        }

        $scope.prevStep = function () {
            $scope.i--;
            if ($scope.i < 0) {
                $location.path('/pd');
            } else {
                $location.path('/contracts/' + $scope.i);
            }
        }

    }])

    //注册页面
    .controller('SignUpCtrl', ['$rootScope', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$interval', function ($rootScope, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $interval) {
        $scope.verifyCodeText = "获取验证码";
        var stop;

        $scope.getVerifyCode = function (phone) {
            if (phone == undefined) {
                $ionicPopup.alert({
                    template: "手机号码不能为空",
                    okText: '确定'
                });

            } else {
                $scope.verifyCodeText = 60;
                stop = $interval(function () {
                    if ($scope.verifyCodeText > 0) {
                        $scope.disable = true;
                        $scope.verifyCodeText = $scope.verifyCodeText - 1;

                    } else {
                        $scope.disable = false;
                        $scope.verifyCodeText = "获取验证码";
                        $scope.stopGetVerifyCode();
                    }
                }, 1000);

                //联网获取验证码
                RemoteService.getPhoneVerifyCode({phoneNum: phone, codeType: 1}, function (data) {
                    if (data.return_code == '0') {

                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: "获取验证码失败," + data.message,
                            okText: '确定'
                        });

                        $scope.disable = false;
                        $scope.verifyCodeText = "获取验证码";
                        $scope.stopGetVerifyCode();
                    }

                }, function (err) {
                    //BusyService.hide();
                    $ionicPopup.alert({
                        title: '提示',
                        template: "获取验证码失败，请检测网络并重试！",
                        okText: '确定'
                    });
                    $scope.disable = false;
                    $scope.verifyCodeText = "获取验证码";
                    $scope.stopGetVerifyCode();

                });

            }

        }

        $scope.stopGetVerifyCode = function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$watch('user.captcha', function (newValue, oldValue) {


            if (newValue != null) {
                $scope.stopGetVerifyCode();
            }


        }, true);
        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $scope.stopGetVerifyCode();
        });

        $scope.signUp = function (user3) {

            BusyService.show('正在注册...');
            //todo user.password=user.password;
            var user = {};
            angular.copy(user3, user);
            user.password = CryptoJS.SHA256(user.password + "") + "";
            RemoteService.registByPhone(user, function (data) {
                if (data.return_code == '200') {
                    BusyService.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '注册成功！',
                        okText: '确定'
                    });
                    alertPopup.then(function (res) {
                        $state.go('signin');
                    });
                }
                else if (data.return_code == '20003') {
                    BusyService.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '手机号已经注册，请使用其他的手机号注册！',
                        okText: '确定'
                    });

                } else {
                    BusyService.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: data.message,
                        okText: '确定'
                    });
                }
            }, function (err) {
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: "注册失败，请重试！",
                    okText: '确定'
                });
            });

            $scope.disable = false;
            $scope.verifyCodeText = "获取验证码";
            $scope.stopGetVerifyCode();


        }

    }])

    .controller('ForgotPasswordCtrl', ['$rootScope', 'BusyService', '$scope', '$state', '$localstorage', '$ionicPopup', 'RemoteService', '$interval', function ($rootScope, BusyService, $scope, $state, $localstorage, $ionicPopup, RemoteService, $interval) {
        $scope.verifyCodeText = "获取验证码";
        var stop;

        $scope.getVerifyCode = function (phoneNum) {
            if (phoneNum == undefined) {
                $ionicPopup.alert({
                    template: "手机号码不能为空",
                    okText: '确定'
                });
            } else {
                $scope.verifyCodeText = 60;
                stop = $interval(function () {
                    if ($scope.verifyCodeText > 0) {
                        $scope.disable = true;
                        $scope.verifyCodeText = $scope.verifyCodeText - 1;

                    } else {
                        $scope.disable = false;
                        $scope.verifyCodeText = "获取验证码";
                        $scope.stopGetVerifyCode();
                    }
                }, 1000);

                //联网获取验证码
                RemoteService.getPhoneVerifyCode({phoneNum: phoneNum, codeType: 2}, function (data) {
                    if (data.return_code == '0') {

                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: "获取验证码失败," + data.message,
                            okText: '确定'
                        });

                        $scope.disable = false;
                        $scope.verifyCodeText = "获取验证码";
                        $scope.stopGetVerifyCode();
                    }

                }, function (err) {

                    $ionicPopup.alert({
                        title: '提示',
                        template: "获取验证码失败，请检测网络并重试！",
                        okText: '确定'
                    });
                    $scope.disable = false;
                    $scope.verifyCodeText = "获取验证码";
                    $scope.stopGetVerifyCode();

                });


            }

        }

        $scope.stopGetVerifyCode = function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        /*  $scope.$watch($scope.user.captcha,function(newValue,oldValue){


         if(newValue!=null){
         $scope.stopGetVerifyCode();
         }
         //alert(""+newValue);

         },true);*/

        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $scope.stopGetVerifyCode();
        });


        $scope.signUp = function (user3) {

            BusyService.show('正在提交...');

            var user = {};
            angular.copy(user3, user);
            user.newPassword = CryptoJS.SHA256(user.newPassword + "") + "";
            RemoteService.findPasswordUpdate({
                phoneNum: user.phoneNum,
                newPassword: user.newPassword,
                captcha: user.captcha
            }, function (data) {
                if (data.return_code == '0') {
                    BusyService.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '修改密码成功！',
                        okText: '确定'
                    });
                    alertPopup.then(function (res) {
                        $state.go('signin');
                    });
                } else {
                    BusyService.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '修改密码失败！' + data.message,
                        okText: '确定'
                    });
                }

            }, function (err) {
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: "修改密码失败，请重试！",
                    okText: '确定'
                });
            });
            $scope.disable = false;
            $scope.verifyCodeText = "获取验证码";
            $scope.stopGetVerifyCode();
        }

    }])
    .controller('FwCtrl', ['$ionicBackdrop', '$ionicSlideBoxDelegate', '$rootScope', 'JpushService', 'BusyService', '$filter', '$scope', '$ionicLoading', '$localstorage', '$state', '$location', '$ionicPopup', '$timeout', '$interval', 'Fws', 'RemoteService', 'webLocalDB', 'LastTime', '$cordovaNetwork', function ($ionicBackdrop, $ionicSlideBoxDelegate, $rootScope, JpushService, BusyService, $filter, $scope, $ionicLoading, $localstorage, $state, $location, $ionicPopup, $timeout, $interval, Fws, RemoteService, webLocalDB, LastTime, $cordovaNetwork) {
        $scope.tss = new Array();
        $scope.zxs = new Array();
        $scope.bgs = new Array();
        $scope.sps = new Array();
        $scope.lcs = new Array();
        //此处使得第一次加载为资讯。。，由于量化占比多，改为量化，此处为0，currentselect为5
        $scope.slideIndex = 1;

        $scope.isVisitor = isVisitor;

        $scope.$on('$cordovaNetwork:offline', function (event, networkState) {

            $scope.isOnline = $cordovaNetwork.isOnline();
            if (!$scope.isOnline) {
                $ionicPopup.alert({
                    title: '网络设置有误',
                    template: '当前网络不可用！',
                    okText: '确定'
                });
            }
        })

        /**
         * 星星分类表：
         * 1；资讯
         * 2：理财
         * 3：视频
         * 4：报告
         * 5：提示
         */
        $scope.tsBadge = 0;
        $scope.zxBadge = 0;
        $scope.bgBadge = 0;
        $scope.spBadge = 0;
        $scope.lcBadge = 0;
        $scope.starInfoCount = 0;

        //共下面调用
        function starInfoCount() {
            $scope.starInfoCount = $scope.tsBadge + $scope.zxBadge + $scope.bgBadge + $scope.spBadge + $scope.lcBadge;
            if ($scope.starInfoCount < 0) {
                $scope.starInfoCount = 0;
            }
            $scope.$emit('fwTabUnReadCount', $scope.starInfoCount);
        }

        function addCategoryBadge(category, currentBadgeCount) {
            if (category == '1') {
                $scope.zxBadge += currentBadgeCount;
            }
            if (category == '2') {
                $scope.lcBadge += currentBadgeCount;
            }
            if (category == '3') {
                $scope.spBadge += currentBadgeCount;
            }
            if (category == '4') {
                $scope.bgBadge += currentBadgeCount;
            }
            if (category == '5') {
                $scope.tsBadge += currentBadgeCount;
            }
            starInfoCount();
        }

        function subCategoryBadge(category, currentBadgeCount) {
            if (category == '1') {
                $scope.zxBadge -= currentBadgeCount;
                if ($scope.zxBadge < 0) {
                    $scope.zxBadge = 0;
                }
            }
            if (category == '2') {
                $scope.lcBadge -= currentBadgeCount;
                if ($scope.lcBadge < 0) {
                    $scope.lcBadge = 0;
                }
            }
            if (category == '3') {
                $scope.spBadge -= currentBadgeCount;
                if ($scope.spBadge < 0) {
                    $scope.spBadge = 0;
                }
            }
            if (category == '4') {
                $scope.bgBadge -= currentBadgeCount;
                if ($scope.bgBadge < 0) {
                    $scope.bgBadge = 0;
                }
            }
            if (category == '5') {
                $scope.tsBadge -= currentBadgeCount;
                if ($scope.tsBadge < 0) {
                    $scope.tsBadge = 0;
                }
            }
            starInfoCount();
        }


        $rootScope.allStar = new Array();
        $scope.badge = 0;
        var fwsdefault = [];
        $scope.fws = fwsdefault;
        var user2 = $localstorage.getObject('user');
        var businessUserId = user2.businessUserId;
        var userId = user2.id;
        //var  userFrontId=userId;
        //alert(userId+"~~");
        $scope.businessUserName = user2.businessUserName;
        if (businessUserId) {
            $scope.businessUserFlag = true;

        } else {
            $scope.businessUserFlag = false;
        }

        $scope.phoneUserId = user2.id;
        $scope.businessUserAvatar = user2.businessUserAvatar;

        $scope.$on('$ionicView.loaded', function () {
            //为了保证第一次载入界面在网络不稳定的情况下会有显示内容.
            $timeout(function () {
                getRemoteStarList($localstorage.getObject('user').sessionId, 1);
            }, 1000);
        });


        $scope.$on('$ionicView.enter', function () {

            var user2 = $localstorage.getObject('user');
            var businessUserId = user2.businessUserId;
            var userId = user2.id;
            if ($rootScope.isChangeUser) {
                $scope.tss = new Array();
                $scope.zxs = new Array();
                $scope.bgs = new Array();
                $scope.sps = new Array();
                $scope.lcs = new Array();
                //alert(userId+":"+userFrontId);
                $rootScope.isChangeUser = false;
            }

            $scope.businessUserName = user2.businessUserName;
            if (businessUserId) {
                $scope.businessUserFlag = true;

            } else {
                $scope.businessUserFlag = false;
            }
            $scope.phoneUserId = user2.id;
            $scope.businessUserAvatar = user2.businessUserAvatar;
            $scope.isVisitor = isVisitor;

            if($localstorage.getObject('user').sessionId == undefined && isVisitor == true) {
                var loginData = {};
                loginData['phone'] = visitor;
                loginData['password'] = CryptoJS.SHA256(visitorPW) + "";
                BusyService.show('登陆中...');

                RemoteService.loginByPhone(loginData,function(data){

                    $scope.loginResponse = '1';
                    if(data.return_code == '200'){
                        BusyService.hide();
                        //user2.businessUserAvatar = data.data.businessUserAvatar;
                        //user2.sessionId = data.data.sessionId;
                        var   user={};
                        user.phone = loginData['phone'];
                        user.password = loginData['password'];
                        user.businessUserId = data.data.businessUserId;
                        user.businessUserName = data.data.businessUserName;
                        user.businessUserAvatar = data.data.businessUserAvatar;
                        user.isActivation = data.data.isActivation;
                        user.sessionId = data.data.sessionId;
                        user.id = data.data.id;
                        user.name = data.data.name;
                        user.avatarUrl = data.data.avatarUrl;

                        $localstorage.setObject('user','');
                        $localstorage.setObject('user',user);
                        //alert(data.data.sessionId+":"+data.data.id);
                        //$localstorage.setObject('user',user2);
                        getRemoteStarList($localstorage.getObject('user').sessionId,1);
                    }else{
                        BusyService.hide();
                        $ionicPopup.alert({
                            title : '提示',
                            template : data.message,
                            okText : '确定'
                        });
                    }
                },function(err){
                    BusyService.hide();
                    $scope.loginResponse = '1';
                    $ionicPopup.alert({
                        title : '提示',
                        template : "登录失败，请重试！",
                        okText : '确定'
                    });
                });
            }else {
                getRemoteStarList($localstorage.getObject('user').sessionId,1);
            }

        });

        $scope.scan22 = function () {
            //二维码扫描绑定业务员，成功后联网获取所有星星
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    var userBindInfo = {};
                    userBindInfo['sessionId'] = $localstorage.getObject('user').sessionId;
                    userBindInfo['businessUserId'] = result.text;
                    RemoteService.addBusinessByUserId(userBindInfo, function (data) {
                        if (data.return_code == '200') {
                            $scope.businessUserFlag = true;
                            $scope.businessUserName = data.data.businessUserName;
                            $scope.businessUserAvatar = data.data.businessUserAvatar;
                            user2.businessUserId = data.data.businessUserId;
                            user2.businessUserName = data.data.businessUserName;
                            user2.businessUserAvatar = data.data.businessUserAvatar;
                            user2.isActivation = data.data.isActivation;
                            user2.sessionId = data.data.sessionId;
                            user2.id = data.data.id;
                            $localstorage.setObject('user', user2);
                            var chatUser = {
                                userId: user2.businessUserId.toString(),
                                badge: 0,
                                lastMessage: '',
                                lastTime: '',
                                ownUser: user2.id.toString()
                            };
                            webLocalDB.insertChatUser(chatUser);
                            //绑定业务员并未更改用户已拥有的星星包
                            Fws.allNewStar({
                                    pageIndex: 1,
                                    sessionId: $localstorage.getObject('user').sessionId
                                }, function (data) {
                                    BusyService.hide();
                                    if (data.return_code == '200') {
                                        var result = data.data;
                                        for (var i = 0; i < fwsdefault.length; i++) {
                                            result.push(fwsdefault[i]);
                                        }
                                        $scope.fws = result;

                                    }
                                    if (data.return_code == '20006') {
                                        BusyService.hide();
                                        $scope.$broadcast('scroll.refreshComplete');
                                        $rootScope.$broadcast('Login:loginTimeOut');
                                    }
                                    $ionicPopup.alert({
                                        title: '提示',
                                        template: '绑定成功！',
                                        okText: '确定'
                                    });
                                }
                            );

                        }
                        if (data.return_code == '20006') {
                            BusyService.hide();
                            $scope.$broadcast('scroll.refreshComplete');
                            $rootScope.$broadcast('Login:loginTimeOut');
                        }

                    }, function (err) {
                        BusyService.hide();
//                        $ionicPopup.alert({
//                            title : '提示',
//                            template : "加载失败，请重试！",
//                            okText : '确定'
//                        });
                    })
                },
                function (error) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: error,
                        okText: '确定'
                    });

                }
            );
        }
        /**
         * 星星分类表：
         * 1；资讯
         * 2：理财
         * 3：视频
         * 4：报告
         * 5：提示
         */
        var lastTime = LastTime.getLastRequestTime();

        $scope.zxResult = {};

        var pageIndex = 1;
        $scope.doRefresh = function () {
            if ($scope.currentSelect == 1) {
                $scope.zxs = new Array();
            }
            if ($scope.currentSelect == 2) {
                $scope.lcs = new Array();
            }
            if ($scope.currentSelect == 3) {
                $scope.sps = new Array();
            }
            if ($scope.currentSelect == 4) {
                $scope.bgs = new Array();
            }
            if ($scope.currentSelect == 5) {
                $scope.tss = new Array();
            }
            getRemoteStarList($localstorage.getObject('user').sessionId, 1);
        }
        document.addEventListener('online', onOnline, false);
        function onOnline() {

        }

        BusyService.show();
        //alert($localstorage.getObject('user').sessionId);
        //初次登录获取所有星星，点击打开其中一个星星
        getRemoteStarList($localstorage.getObject('user').sessionId, 1);
        function getRemoteStarList(sessionId, pageIndex) {
            Fws.allNewStar({sessionId: sessionId, pageIndex: pageIndex}, function (data) {
                BusyService.hide();
                if (data.return_code == '200') {
                    webLocalDB.deleteStar();
                    var result = data.data;
                    $scope.zxResult = data.data;
                    var zxStar = new Array();
                    for (var i = 0; i < result.length; i++) {
                        $scope.zxResult[i].ownUser = $localstorage.getObject('user').id.toString();
                        $scope.zxResult[i].lastStarInfoTime = $filter('date')($scope.zxResult[i].lastStarInfoTime, 'yyyy年MM月dd日 HH:mm:ss');
                        $scope.zxResult[i].buyEndTime = $filter('date')($scope.zxResult[i].buyEndTime, 'yyyy年MM月dd日 HH:mm:ss');
                        // $scope.zxResult[i].createTime = $filter('date')($scope.zxResult[i].createTime,'yyyy年MM月dd日 HH:mm:ss');
                        webLocalDB.insertStar($scope.zxResult[i]);
                        webLocalDB.updateStar($scope.zxResult[i]);
                    }

                    // selectStarDing($scope.zxResult);
                    selectStar();
                    // $scope.$broadcast('scroll.refreshComplete');
                }
                if (data.return_code == '20006') {
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }

            }, function (err) {
                BusyService.hide();
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.isOnline = $cordovaNetwork.isOnline();
                //if (!$scope.isOnline) {
                //    $ionicPopup.alert({
                //        title: '网络设置有误',
                //        template: '当前网络不可用！',
                //        okText: '确定'
                //    });
                //} else {
                //    $ionicPopup.alert({
                //        title: '提示',
                //        template: '加载失败，请重试！',
                //        okText: '确定'
                //    });
                //}
            });
        }
        //无用声明，弃用
        $scope.currentSelect = '1';
        function selectStar() {
            //alert($localstorage.getObject('user').id+"~~~");
            webLocalDB.selectStar($localstorage.getObject('user').id, selectStarResult);
        }
		//已弃用该变量，以前用来判断界面是否第一次加载，无用
        var isFirstLoad = true;

        function selectStarResult(tx, result) {
            // var starIds = [];
            var rowList = result.rows;
            var localStars = new Array();
            for (var i = 0; i < rowList.length; i++) {
                var row = rowList.item(i);
                var star = {};
                for (var j in row) {
                    if (j == 'id') {
                        star.id = row[j];
                        // starIds.push(star.id.toString().replace(/-/g,""));
                    }
                    if (j == 'name') {
                        star.name = row[j];
                    }
                    if (j == 'newName') {
                        star.newName = row[j] == 'undefined' ? '' : row[j];
                    }
                    if (j == 'price') {
                        star.price = row[j] == 'undefined' ? '' : row[j];
                    }
                    if (j == 'description') {
                        star.description = row[j] == 'undefined' ? '未定义' : row[j];
                    }
                    if (j == 'lastStarInfoTitle') {
                        star.lastStarInfoTitle = row[j] == 'undefined' ? '' : row[j];
                    }
                    if (j == 'headImg') {
                        star.headImg = row[j];
                    }
                    if (j == 'lastStarInfoTime') {
                        star.lastStarInfoTime = row[j] == 'undefined' ? '' : row[j];
                    }
                    if (j == 'buyEndTime') {
                        star.buyEndTime = row[j] == 'undefined' ? '未购买' : row[j];

                        //star.buyEndTime = row[j]=='undefined'?'未购买':(star.buyEndTime-new Date().getTime()<0?'已过期':row[j]);
                    }
                    if (j == 'createTime') {
                        star.createTime = row[j] == 'undefined' ? '' : row[j];
                    }
                    if (j == 'category') {
                        star.category = row[j];
                    }
                    if (j == 'badge') {
                        star.badge = row[j] == 'undefined' ? 0 : row[j];
                    }
                    if (j == 'eStarUserId') {
                        star.eStarUserId = row[j] == 'undefined' ? '' : row[j];
                    }
                    if(j == 'needBuy'){
                        star.needBuy = row[j]=='undefined'?'':row[j];
                    }
                }
                if(star.needBuy && star.needBuy == "2") {
                    star.buyEndTime = "";
                    star.price = "";
                    //star.price = "免费";
                }
                localStars.push(star);
            }
            // JpushService.setTagsWithAlias(starIds,userId);
            JpushService.setAlias($localstorage.getObject('user').id + "");


            $scope.allStar = localStars;

           if(isFirstLoad){
                    isFirstLoad = false;
                    for(var i = 1; i <= 5; i++){
                        if(i == 1){
                            $scope.zxs = getStarsList(1,$scope.allStar,$scope.zxs);
                        }
                        if(i == 2){
                            $scope.lcs = getStarsList(2,$scope.allStar,$scope.lcs);

                        }
                        if(i==3){
                            $scope.sps = getStarsList(3,$scope.allStar,$scope.sps);
                        }
                        if(i==4){
                             $scope.bgs = getStarsList(4,$scope.allStar,$scope.bgs);
                        }
                        if(i ==5){
                            $scope.tss = getStarsList(5,$scope.allStar,$scope.tss);
                        }
                    }
                }else {
                    if($scope.currentSelect == 1){
                        $scope.zxs = getStarsList($scope.currentSelect,$scope.allStar,$scope.zxs);
                    }
                    if($scope.currentSelect == 2){
                            $scope.lcs = getStarsList($scope.currentSelect,$scope.allStar,$scope.lcs);
                    }
                    if($scope.currentSelect == 3){
                        $scope.sps = getStarsList($scope.currentSelect,$scope.allStar,$scope.sps);
                    }
                    if($scope.currentSelect == 4){
                        $scope.bgs = getStarsList($scope.currentSelect,$scope.allStar,$scope.bgs);
                    }
                    if($scope.currentSelect == 5){
                        $scope.tss = getStarsList($scope.currentSelect,$scope.allStar,$scope.tss);
                    }
                }

            $scope.$broadcast('scroll.refreshComplete');
        }

        function getStarsList(currentSelect, allStarsList, currentStarsList) {
            var allStar = allStarsList;
            var zxStar = new Array();
            //console.log("######################0"+ angular.toJson(currentStarsList,true));
            for (var i = 0; i < allStar.length; i++) {
                var star = allStar[i];
                if (star.category == currentSelect) {
                    var isNew = true;
                    for (var j = 0; j < currentStarsList.length; j++) {
                        if (star.id == currentStarsList[j].id) {
                            isNew = false;
                            star.isNew = false;
                            console.log("!!!!!!!!!!!!!!!!");
                            if (star.buyEndTime != currentStarsList[j].buyEndTime | star.lastStarInfoTitle != currentStarsList[j].lastStarInfoTitle | star.name != currentStarsList[j].name | star.price != currentStarsList[j].price) {
                                //console.log("######################");
                                currentStarsList.splice(j, 1, star);
                            }
                            break;
                        }

                    }
                    if (isNew) {
                        star.isNew = true;
                    }
                    zxStar.push(star);
                }
            }


            /*  Array.prototype.contains = function (obj) {
             var i = this.length;
             while (i--) {
             if (this[i] === obj) {
             return true;
             }
             }
             return false;
             }
             */

            /*alert(angular.toJson(allStar,true));
             alert(angular.toJson(currentStarsList,true));*/
            /*for(var j = 0; j < currentStarsList.length;j++){
             var dec=true;
             for(var i=0; i < allStar.length&&dec; i++){
             var star = allStar[i];
             if(currentStarsList[j].id==star.id&&star.category == currentSelect) {
             dec=false; continue;
             }
             }
             if(dec){currentStarsList.splice(j,1);}

             }*/
            for (var i = 0; i < zxStar.length; i++) {
                if (zxStar[i].isNew) {
                    //添加zxStar到数组头部
                    // console.log("!!!!!!!!!!!!!!!!isNew");
                    currentStarsList.unshift(zxStar[i]);
                }
            }


            return currentStarsList;
        }

        function getCategoryStarsList(index) {
            if (index == 0) {
                $scope.currentSelect = '5';
                $scope.tss = getStarsList($scope.currentSelect, $rootScope.allStar, $scope.tss);
            }
            if (index == 1) {
                $scope.currentSelect = '1';
                $scope.zxs = getStarsList($scope.currentSelect, $rootScope.allStar, $scope.zxs);
            }
            if (index == 2) {
                $scope.currentSelect = '4';
                $scope.bgs = getStarsList($scope.currentSelect, $rootScope.allStar, $scope.bgs);
            }
            if (index == 3) {
                $scope.currentSelect = '3';
                $scope.sps = getStarsList($scope.currentSelect, $rootScope.allStar, $scope.sps);
            }
            if (index == 4) {
                $scope.currentSelect = '2';
                $scope.lcs = getStarsList($scope.currentSelect, $rootScope.allStar, $scope.lcs);
            }
        }

        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;
            getCategoryStarsList(index);
        }
        $scope.activeSlide = function (index) {
            $ionicSlideBoxDelegate.slide(index);
            getCategoryStarsList(index);
        };
        var checkUserIsBuy = $scope.checkUserIsBuy = function(starId,starname,price,description,badges,category,eStarUserId,needBuy){
            if(needBuy == '1'){
                var params = {};
                params.eStarUserId = eStarUserId;
                BusyService.show();
                RemoteService.checkIsBuy({eStarUserId:params.eStarUserId,sessionId:$localstorage.getObject('user').sessionId.toString()},function(data){
                    BusyService.hide();
                    if(data.return_code == 200){
                        var isBuy = data.data.isBuy;
                        var userId=data.data.userId;
                        if(userId == " " || userId == null || userId == undefined){
                            $ionicPopup.alert({
                                title : '提示',
                                template : "您的咨询服务设置有误，请联系您的服务人员",
                                okText : '确定'
                            });
                            return;
                        }
                        webLocalDB.updateStar(data.data);
                        if(isBuy == 1){
                            var endTime = data.data.buyEndTime;
                            var now = new Date().getTime();
                            if(endTime - now >= 0){
                                clearStarBadge(category,starId,badges);
                                console.log("---------------------starId is: " + starId);
                                if(starId==riskCalculator){
                                    $location.path('/tab/fwlcal');
                                }else if(starId == userBalanceStarId){
                                    if(isAccountLogin) {
                                        $location.path('/balanceParams');
                                    }else {
                                        //资金账号登录后要进的页面。0，付款页面。1，用户权益界面。2，用户业绩界面
                                        $location.path('/accountloginin/1');
                                    }
                                }else if(starId == userPerformanceStarId){
                                    if(isAccountLogin) {
                                        $location.path('/performanceParams');
                                    }else {
                                        //资金账号登录后要进的页面。0，产品价格列表页面。1，用户权益界面。2，用户业绩界面
                                        $location.path('/accountloginin/2');
                                    }
                                }else{
                                    $location.path('/tab/fwl/' + starId);
                                }
                            }else {

                                var confirmPopup = $ionicPopup.confirm({
                                    template: '<b>单价：</b> ¥'+price+'.00/月<br/><b>详情：</b><div style="BORDER-RIGHT: darkgray 1px solid; BORDER-TOP: darkgray 1px solid; BORDER-LEFT: darkgray 1px solid; BORDER-BOTTOM: darkgray 1px solid;  SCROLLBAR-SHADOW-COLOR: #3d5054; SCROLLBAR-3DLIGHT-COLOR: #3d5054; SCROLLBAR-ARROW-COLOR: #ffd6da;SCROLLBAR-DARKSHADOW-COLOR: #85989c;SCROLLBAR-FACE-COLOR: #889b9f;  SCROLLBAR-HIGHLIGHT-COLOR: #c3d6da;OVERFLOW: auto;WIDTH:227px;  HEIGHT: 150px" align=center> <P >'+description+'</P></div>',
                                    title: '<b>'+starname+'</b>',
                                    okText:"购买",
                                    cancelText:"取消"
                                });
                                confirmPopup.then(function(res) {
                                    if(res) {
                                        RemoteService.needAccountLogin({
                                            starId: starId
                                        }, function (data) {
                                            BusyService.hide();
                                            if (data.return_code == '200') {
                                                needAccountLogin = data.needlogin==0 ? true : false;

                                                temp.eStarUserId = eStarUserId;
                                                temp.userId = userId;
                                                temp.starname = starname;
                                                temp.description = description;
                                                temp.price = price;
                                                temp.starId = starId;

                                                if(needAccountLogin && !isAccountLogin) {
                                                    $location.path('/accountloginin/0');
                                                }else {
                                                    $location.path('/pd');
                                                }

                                            }
                                        }, function (err) {
                                            BusyService.hide();
                                        });
                                    } else {
                                    }
                                });
                            }
                        }else {

                            var confirmPopup = $ionicPopup.confirm({
                                template: '<b>单价：</b> ¥'+price+'.00/月<br/><b>详情：</b><div style="BORDER-RIGHT: darkgray 1px solid; BORDER-TOP: darkgray 1px solid; BORDER-LEFT: darkgray 1px solid; BORDER-BOTTOM: darkgray 1px solid;  SCROLLBAR-SHADOW-COLOR: #3d5054; SCROLLBAR-3DLIGHT-COLOR: #3d5054; SCROLLBAR-ARROW-COLOR: #ffd6da;SCROLLBAR-DARKSHADOW-COLOR: #85989c;SCROLLBAR-FACE-COLOR: #889b9f;  SCROLLBAR-HIGHLIGHT-COLOR: #c3d6da;OVERFLOW: auto;WIDTH:227px;  HEIGHT: 150px" align=center> <P >'+description+'</P></div>',
                                title: '<b>'+starname+'</b>',
                                okText:"购买",
                                cancelText:"取消"
                            });

                            confirmPopup.then(function(res) {
                                if(res) {


                                    RemoteService.needAccountLogin({
                                        starId: starId
                                    }, function (data) {
                                        BusyService.hide();
                                        if (data.return_code == '200') {
                                            needAccountLogin = data.needlogin == 0 ? true : false;

                                            temp.eStarUserId = eStarUserId;
                                            temp.userId = userId;
                                            temp.starname = starname;
                                            temp.description = description;
                                            temp.price = price;
                                            temp.starId = starId;

                                            if (needAccountLogin && !isAccountLogin) {
                                                $location.path('/accountloginin/0');
                                            } else {
                                                $location.path('/pd');
                                            }

                                        }
                                    }, function (err) {
                                        BusyService.hide();
                                    });
                                } else {
                                }
                            });

                        }

                    }
                    if(data.return_code == '20006'){
                        BusyService.hide();
                        $scope.$broadcast('scroll.refreshComplete');
                        $rootScope.$broadcast('Login:loginTimeOut');
                    }
                },function(err){
                    BusyService.hide();
                    //$ionicPopup.alert({
                    //    title : '提示',
                    //    template : "加载失败，请重试！",
                    //    okText : '确定'
                    //});
                })
            }
            else {

                clearStarBadge(category,starId,badges);
                console.log("---------------------starId is: " + starId);
                if(starId==riskCalculator){
                    $location.path('/tab/fwlcal');
                }else if(starId == userBalanceStarId){
                    if(isAccountLogin) {
                        $location.path('/balanceParams');
                    }else {
                        //资金账号登录后要进的页面。0，付款页面。1，用户权益界面。2，用户业绩界面
                        $location.path('/accountloginin/1');
                    }
                }else if(starId == userPerformanceStarId){
                    if(isAccountLogin) {
                        $location.path('/performanceParams');
                    }else {
                        //资金账号登录后要进的页面。0，产品价格列表页面。1，用户权益界面。2，用户业绩界面
                        $location.path('/accountloginin/2');
                    }
                }else{
                    $location.path('/tab/fwl/' + starId);
                }
            }

        }
        function clearStarBadge(category, starId, badges) {
            webLocalDB.clearStarBadge(starId);
            if (badges == undefined || badges == null || badges == '') {
                badges = 0;
            }
            /**
             * 星星分类表：
             * 1；资讯
             * 2：理财
             * 3：视频
             * 4：报告
             * 5：提示
             */
            var currentBadge = 0;
            if (category == '1') {
                for (var i = 0; i < $scope.zxs.length; i++) {
                    if (starId == $scope.zxs[i].id) {
                        currentBadge = $scope.zxs[i].badge;
                        $scope.zxs[i].badge = 0;
                        break;
                    }
                }
            }
            if (category == '2') {
                for (var i = 0; i < $scope.lcs.length; i++) {
                    if (starId == $scope.lcs[i].id) {
                        currentBadge = $scope.lcs[i].badge;
                        $scope.lcs[i].badge = 0;
                        break;
                    }
                }
            }
            if (category == '3') {
                for (var i = 0; i < $scope.sps.length; i++) {
                    if (starId == $scope.sps[i].id) {
                        currentBadge = $scope.sps[i].badge;
                        $scope.sps[i].badge = 0;
                        break;
                    }
                }
            }
            if (category == '4') {
                for (var i = 0; i < $scope.bgs.length; i++) {
                    if (starId == $scope.bgs[i].id) {
                        currentBadge = $scope.bgs[i].badge;
                        $scope.bgs[i].badge = 0;
                        break;
                    }
                }
            }
            if (category == '5') {
                for (var i = 0; i < $scope.tss.length; i++) {
                    if (starId == $scope.tss[i].id) {
                        currentBadge = $scope.tss[i].badge;
                        $scope.tss[i].badge = 0;
                        break;
                    }
                }
            }

            subCategoryBadge(category, currentBadge);
        }

        //极光推送
        $rootScope.$on('JpushService:openNotification', function (event, alertContent, alertExtras) {
            JpushService.setApplicationIconBadgeNumber(0);

            //alert("openNotification");
            var jpushNotification = {};
            var flag = true;
            jpushNotification.category = alertExtras.category;
            jpushNotification.starInfoId = alertExtras.starInfoId;
            jpushNotification.starId = alertExtras.starId;
            if (flag) {
                flag = false;
                webLocalDB.selectStarById(jpushNotification.starId, user2.id, function (tx, result) {
                    var rowList = result.rows;
                    var starArr = new Array();
                    for (var i = 0; i < rowList.length; i++) {
                        var row = rowList.item(i);
                        var star = {};
                        for (var j in row) {
                            star[j] = row[j];
                        }
                        starArr.push(star);
                    }
                    jpushNotification.eStarUserId = starArr[0].eStarUserId;
                    jpushNotification.starName = starArr[0].starName;

                    /**
                     * 星星分类表：
                     * 1；资讯  1
                     * 2：理财  4
                     * 3：视频  3
                     * 4：报告  2
                     * 5：提示  0
                     */
                    if (jpushNotification.category == '5') {
                        var index = 0;
                        $scope.activeSlide(index);
                    } else if (jpushNotification.category == '4') {
                        var index = 2;
                        $scope.activeSlide(index);
                    } else if (jpushNotification.category == '2') {
                        var index = 4;
                        $scope.activeSlide(index);
                    } else {
                        $scope.activeSlide(jpushNotification.category);
                    }
                    // $scope.activeSlide(jpushNotification.category);
                    if (jpushNotification.category == '5') {

                        checkUserIsBuy(jpushNotification.starId, 0, null, null, null, jpushNotification.category, jpushNotification.eStarUserId);
                    } else {
                        checkUserIsBuyForJpush(jpushNotification.starInfoId, jpushNotification.starName, jpushNotification.starId, jpushNotification.category, jpushNotification.eStarUserId);
                    }
                });

            }

        });
        function checkUserIsBuyForJpush(starInfoId, starId, starName, starCategory, eStarUserId) {
            BusyService.show();
            //是资讯时进行操作
            if (starCategory == 1 || starCategory == 3) {
                var params = {};
                params.eStarUserId = eStarUserId;
                RemoteService.checkIsBuy({
                    eStarUserId: params.eStarUserId,
                    sessionId: $localstorage.getObject('user').sessionId
                }, function (data) {
                    BusyService.hide();
                    if (data.return_code == 200) {
                        data.data.ownUser = user2.id;
                        webLocalDB.updateStar(data.data);
                        var isBuy = data.data.isBuy;
                        if (isBuy == 1) {
                            var endTime = data.data.buyEndTime;
                            var now = new Date().getTime();
                            if (endTime - now >= 0 && starCategory == 1) {
                                clearStarBadge(starCategory, starId, 0);
                                $location.path('/tab/fws/fwdetail/' + starInfoId + '/' + starId + '/' + starCategory + '/' + eStarUserId);
                            } else if (endTime - now >= 0 && starCategory == 3) {
                                clearStarBadge(starCategory, starId, 0);
                                RemoteService.getStarInfoById({
                                    starInfoId: starInfoId,
                                    sessionId: $localstorage.getObject('user').sessionId.toString()
                                }, function (data) {
                                    if (data.return_code == '200') {
                                        BusyService.hide();
                                        var addfile = data.data.addFile;
                                        window.playerDing.play(
                                            function (results) {
                                                //alert("ok"+results);
                                            }, function (error) {
                                                //alert('url:' + $scope.fwList.addFile);
                                            }, addfile
                                        );
                                    }
                                    if (data.return_code == '20006') {
                                        BusyService.hide();
                                        $rootScope.$broadcast('Login:loginTimeOut');
                                    }
                                }, function (err) {
                                    BusyService.hide();
                                    $ionicPopup.alert({
                                        title: '提示',
                                        template: "加载失败，请重试！",
                                        okText: '确定'
                                    });
                                })


                            } else {
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: "<b>尊敬的用户，您好，您的购买已经过期，请联系的业务员购买，谢谢！!</b>",
                                    okText: '确定'
                                });
                            }
                        } else {
                            $ionicPopup.alert({
                                title: '提示',
                                template: "尊敬的用户，您好，您还没有购买此信息，请联系业务员购买，谢谢！",
                                okText: '确定'
                            });
                        }

                    }
                    if (data.return_code == '20006') {
                        BusyService.hide();
                        $scope.$broadcast('scroll.refreshComplete');
                        $rootScope.$broadcast('Login:loginTimeOut');
                    }
                }, function (err) {
                    BusyService.hide();
                    $ionicPopup.alert({
                        title: '提示',
                        template: "加载失败，请重试！",
                        okText: '确定'
                    });
                })
            } else {
                //不是得话打开fwdetail
                BusyService.hide();
                clearStarBadge(starCategory, starId, 0);
                $location.path('/tab/fws/fwdetail/' + starInfoId + '/' + starName + '/' + starCategory + '/' + eStarUserId);
            }
        }

        $scope.isShowBadge = false;

        $rootScope.$on('JpushService:receiveNotification', function (event, alertContent, alertExtras) {
            //alert("receiveNotification");
            if ($scope.isShowBadge) {


                var jpushNotification = {};


                jpushNotification.category = alertExtras.category;

                jpushNotification.starId = alertExtras.starId;

                /**
                 * 星星分类表：
                 * 1；资讯
                 * 2：理财
                 * 3：视频
                 * 4：报告
                 * 5：提示
                 */
                if (jpushNotification.category == '1') {
                    for (var i = 0; i < $scope.zxs.length; i++) {
                        if ($scope.zxs[i].id == jpushNotification.starId) {
                            $scope.zxs[i].badge += 1;
                            break;
                        }
                    }
                }
                if (jpushNotification.category == '2') {
                    for (var i = 0; i < $scope.lcs.length; i++) {
                        if ($scope.lcs[i].id == jpushNotification.starId) {
                            $scope.lcs[i].badge += 1;
                            break;
                        }
                    }
                }
                if (jpushNotification.category == '3') {
                    for (var i = 0; i < $scope.sps.length; i++) {
                        if ($scope.sps[i].id == jpushNotification.starId) {
                            $scope.sps[i].badge += 1;
                            break;
                        }
                    }
                }
                if (jpushNotification.category == '4') {
                    for (var i = 0; i < $scope.bgs.length; i++) {
                        if ($scope.bgs[i].id == jpushNotification.starId) {
                            $scope.bgs[i].badge += 1;
                            console.log("bgs" + i + ":::" + $scope.bgs[i].badge);
                            break;
                        }
                    }
                }
                if (jpushNotification.category == '5') {
                    for (var i = 0; i < $scope.tss.length; i++) {
                        if ($scope.tss[i].id == jpushNotification.starId) {
                            $scope.tss[i].badge += 1;
                            break;
                        }
                    }
                }
                addCategoryBadge(jpushNotification.category, 1);
            }
        });
        //此处曾经放置延时操作，来处理极光推送，后来改掉。
    }])
    .controller('FwListCalCtrl', ['$scope', '$filter', '$timeout', function ($scope, $filter, $timeout) {


        $scope.preferences = {
            gender: [
                {selected: true, name: "1%", value: 1},
                {selected: true, name: "2%", value: 2},
                {selected: true, name: "3%", value: 3},
                {selected: true, name: "4%", value: 4},
                {selected: true, name: "5%", value: 5},
                {selected: true, name: "6%", value: 6}
            ]
        };
        $scope.prefGender = $scope.preferences.gender[3];
        bailProp = $scope.prefGender.value;
        $scope.chang = function (gender) {
            bailProp = gender.value;
        }


        $scope.cal = function (totalMoney, transProportion, contractName, tonnes, riskSpread) {
            var ots = totalMoney * transProportion / tonnes / riskSpread / 100;
            $scope.openLots = $filter('number')(ots, '2');
            var tempBail = totalMoney * transProportion / 10000 * bailProp;
            $scope.bail = $filter('number')(tempBail, '2');
        }
    }])
    .controller('FwListCtrl', ['$rootScope', 'BusyService', '$location', 'UUIDFac',
        'RemoteService', 'StoreUp', '$filter', '$scope', '$stateParams', '$interval', '$timeout',
        '$ionicPopup', 'Fws', 'FwLists', '$localstorage', 'webLocalDB', 'LastTime', '$ionicScrollDelegate', 'JpushService',
        function ($rootScope, BusyService, $location, UUIDFac, RemoteService, StoreUp, $filter, $scope, $stateParams, $interval, $timeout, $ionicPopup, Fws, FwLists, $localstorage, webLocalDB, LastTime, $ionicScrollDelegate, JpushService) {
            $scope.fwLists = new Array();
            $scope.lastTime = LastTime.getLastRequestTime();
            var user2 = $localstorage.getObject('user');
            var businessUserId = user2.businessUserId;
            webLocalDB.selectStarById($stateParams.fwId, user2.id, selectStarResult);

            function selectStarResult(tx, result) {
                var rowList = result.rows;
                for (var i = 0; i < rowList.length; i++) {
                    var row = rowList.item(i);
                    var star = {};
                    for (var j in row) {
                        if (j == 'category') {
                            star.category = row[j];
                        }
                        if (j == 'name') {
                            if (row[j] != 'undefined') {
                                star.name = row[j];
                            }
                        }
                        if (j == 'newName') {
                            if (row[j] != 'undefined') {
                                star.newName = row[j];
                            }
                        }
                        if (j == 'eStarUserId') {
                            if (row[j] != 'undefined') {
                                star.eStarUserId = row[j];
                            }
                        }
                        if(j == 'needBuy'){
                            star.needBuy = row[j]=='undefined'?'':row[j];
                        }
                    }
                    $scope.star = star;
                }
            }

            $scope.checkUserIsBuy = function(starInfoId,starId,starCategory,eStarUserId,isPDF,addfile){
                //alert(starInfoId+"~"+starId+"~"+starCategory+"~"+eStarUserId);
                if($scope.star.category == 3){
                    //获得videourl启动video插件
                    RemoteService.getStarInfoById({starInfoId:starInfoId,sessionId:$localstorage.getObject('user').sessionId.toString()},function(data){
                        if(data.return_code == '200'){
                            BusyService.hide();
                            var addfile=data.data.addFile;
                            if(/https/.test(addfile)) {
                                var reg=/https:\/\/(\d+\.\d+\.\d+\.(\d+))(\S*)/;
                                var arr = reg.exec(addfile);
                                //195的聊天端口为15825
                                //196的聊天端口为15121
                                var port = arr[2]=="195" ? ":15825" : ":15121";
                                addfile = "http://" + arr[1] + port + arr[3];
                            }
                            console.dir(addfile);
                            $location.path('/tab/fws/fwdetail/'+starInfoId+'/'+$stateParams.fwId+'/'+$scope.star.category+'/'+eStarUserId);
                        }
                        if(data.return_code == '20006'){
                            BusyService.hide();
                            $rootScope.$broadcast('Login:loginTimeOut');
                        }
                    },function(err){
                        BusyService.hide();
                    })

                }
                else {
                    function doIsPdf(bool) {
                        if (typeof(bool) == 'string') {
                            if (bool == 'true') {
                                return true;
                            } else {
                                return false;
                            }
                        } else if (typeof(bool) == 'boolean') {
                            return bool;
                        } else {
                            return false;
                        }
                    }
                    
                    if(doIsPdf(isPDF)) {
                        openFile(addfile);
                    } else {
                        $location.path('/tab/fws/fwdetail/'+starInfoId+'/'+$stateParams.fwId+'/'+$scope.star.category+'/'+eStarUserId);
                    }
                }
            };
            function openFile(url) {
                var devicePlatform = ionic.Platform.platform();
                switch (devicePlatform){
                    case 'android':
                        /**
                         * Android devices cannot open up PDFs in a sub web view (inAppBrowser) so the PDF needs to be downloaded and then opened with whatever
                         * native PDF viewer is installed on the app.
                         */
                        var urlArr =  url.split(".");
                        var fileNameExten = urlArr[urlArr.length-1];
                        var fileURL = cordova.file.externalApplicationStorageDirectory+"local." + fileNameExten;
                        var fileTransfer = new FileTransfer();
                        var uri = encodeURI( url );
                        BusyService.show();
                        fileTransfer.download(
                            uri,
                            fileURL,
                            function(entry) {
                                BusyService.hide();
                                window.pdf.openPdf(
                                    function(results) {
                                    }, function (error) {
                                    },entry.toURL()
                                );
                            },
                            function(error) {
                                BusyService.hide();
                                $ionicPopup.alert({
                                    title : '提示',
                                    template : "加载失败，请重试！",
                                    okText : '确定'
                                });
                            },
                            true
                        );


                        break;
                    default:

                        /**
                         * IOS and browser apps are able to open a PDF in a new sub web view window. This uses the inAppBrowser plugin
                         */
                        var ref = window.open(url, '_blank', 'location=no,toolbar=yes,closebuttoncaption=Close PDF,enableViewportScale=yes');
                        break;
                }
            }
            BusyService.show();
            $scope.pageIndexs = 0;
            $scope.getRemoteStarInfoList = function(starId,sessionId,now){
                //alert("!!!!!!!!!!!!!!!!!!!getRemoteStarInfoList"+angular.toJson($scope.fwLists,true));
                FwLists.all({starId:starId,pageIndex:$scope.pageIndexs,sessionId:sessionId,now:now},function(data){
                    BusyService.hide();
                    if(data.return_code == '200'){
                        if($scope.pageIndexs ==1){
                            $scope.fwLists = new Array();
                        }
                        var result = data.data;
                        $scope.starInfolist = data.data;

                        var zxStar = new Array();
                        if(result.length<10){
                            $scope.hasMoreData = false;
                        }
                        for(var i=0; i < result.length; i++){

                            $scope.starInfolist[i].ownUser =user2.id.toString();
                            $scope.starInfolist[i].dateTime = $filter('date')($scope.starInfolist[i].datetime,'yyyy-MM-dd HH:mm:ss');
                            if($scope.starInfolist[i].headImg=="00000100"){
                                $scope.starInfolist[i].headImg="img/up.png" ;
                            }else if($scope.starInfolist[i].headImg=="00000101"){
                                $scope.starInfolist[i].headImg="img/down.png";
                            }else {
                                $scope.starInfolist[i].headImg="undefined";
                            }
                            if($scope.starInfolist[i].addFile && $scope.starInfolist[i].addFile.indexOf(".pdf")>0) {
                                $scope.starInfolist[i].isPDF = true;
                            }else {
                                $scope.starInfolist[i].isPDF = false;
                            }
                            $scope.fwLists.push($scope.starInfolist[i]);

                        }
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                    if(data.return_code == '20006'){
                        BusyService.hide();
                        $scope.$broadcast('scroll.refreshComplete');
                        $rootScope.$broadcast('Login:loginTimeOut');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                },function(err){
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    BusyService.hide();
                    $ionicPopup.alert({
                        title : '提示',
                        template : "加载失败，请重试!",
                        okText : '确定'
                    });
                });
            }
            $scope.hasMoreData = true;

            $rootScope.$on('JpushService:openNotificationCurrentList', function (event, alertContent, alertExtras) {
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
                $scope.getRemoteStarInfoList($stateParams.fwId, $localstorage.getObject('user').sessionId, new Date());
            });
//刷新和进入要拿到starInfoList
            $scope.doRefresh = function () {
                $scope.pageIndexs = 1;
                $scope.getRemoteStarInfoList($stateParams.fwId, $localstorage.getObject('user').sessionId, new Date());
            };
            $scope.$on('$ionicView.enter', function () {
                // $scope.pageIndexs = 1;
                // $scope.getRemoteStarInfoList($stateParams.fwId,$localstorage.getObject('user').sessionId,new Date());
            });

            $scope.addStoreStarInfo = function (item) {
                BusyService.show("增加收藏中...");
                var storeUp = {};
                storeUp.id = UUIDFac.getUUID().id;
                storeUp.starInfoId = item.id
                storeUp.userName = item.title
                storeUp.headImg = item.headImg;
                storeUp.name = item.title;
                storeUp.content = item.message;
                storeUp.userId = $localstorage.getObject('user').id.toString();
                storeUp.sessionId = $localstorage.getObject('user').sessionId.toString();
                storeUp.datetime = $filter('date')(new Date(), 'yyyy年MM月dd日');
                RemoteService.addStoreUp(storeUp, function (data) {
                    if (data.return_code == '20006') {
                        BusyService.hide();
                        $rootScope.$broadcast('Login:loginTimeOut');
                    }
                }, function (err) {
                    BusyService.hide();
                    $ionicPopup.alert({
                        title: '提示',
                        template: "加载失败，请重试！",
                        okText: '确定'
                    });
                });
                webLocalDB.insertStoreUp(storeUp);
                $timeout(function () {
                    BusyService.hide();
                }, 500);

                $ionicPopup.alert({
                    title: '提示',
                    template: "<b>收藏成功!</b>",
                    okText: '关闭'
                });
            }

            //载入更多
            $scope.loadMore = function () {
                $scope.pageIndexs += 1;
                $scope.getRemoteStarInfoList($stateParams.fwId, $localstorage.getObject('user').sessionId, new Date());
            }
        }])
    //详情页
    .controller('FwDetailCtrl', ['$filter', '$rootScope', 'BusyService', '$ionicPopup', 'RemoteService', '$localstorage', '$location', 'webLocalDB', '$scope', '$stateParams', 'Fws', 'FwLists', function ($filter, $rootScope, BusyService, $ionicPopup, RemoteService, $localstorage, $location, webLocalDB, $scope, $stateParams, Fws, FwLists) {

        var user2 = $localstorage.getObject('user');
        $scope.fwList = {};
        $scope.category = $stateParams.fwCategory;
        $scope.eStarUserId = $stateParams.fweStarUserId;
        $scope.titleFore = "";
        var starId = $stateParams.starId;
        var starInfoId = $stateParams.fwListId;
        var sessionId = $localstorage.getObject('user').sessionId.toString();
        BusyService.show();
        //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!starname：" + starName);
        RemoteService.getStarInfoById({
            starInfoId: $stateParams.fwListId,
            sessionId: $localstorage.getObject('user').sessionId.toString()
        }, function (data) {
            if ($scope.category == 3) {
                $scope.starInfo = data.data;
                var videoUrl = data.data.addFile;
                if (videoUrl.substring(0, 5) == "https") {
                    videoUrl = videoUrl.substring(8, videoUrl.length);
                    var array = videoUrl.split("/");
                    var array1 = array.splice(0, 1);
                    var array2 = array.splice(0, array.length);
                    var arrayOfServer = array1[0].split(".");

                    if (arrayOfServer[arrayOfServer.length - 1] == "195") {
                        videoUrl = "http://" + array1[0] + ":15825" + "/" + array2.join("/");
                    } else {
                        videoUrl = "http://" + array1[0] + ":15121" + "/" + array2.join("/");
                    }
                }
                $scope.starInfo.addFile = videoUrl;
                $scope.fwList = $scope.starInfo;
            }
            if (starId != VECstarId) {
                BusyService.hide();
                $scope.blooean = false;
            }
            if (data.return_code == '200') {
                $scope.starInfo = data.data;
                $scope.addfilepdf = data.data.addFile;
                $scope.starInfo.dateTime = $filter('date')($scope.starInfo.datetime, 'yyyy-MM-dd HH:mm:ss');

                if (starId == VECstarId) {
                    $scope.titleFore = "监测时间:";
                    RemoteService.fwdetailImage({
                        starinfoid: $stateParams.fwListId,
                        sessionId: $localstorage.getObject('user').sessionId.toString()
                    }, function (data) {
                        BusyService.hide();
                        if (data.return_code == '200') {
                            $scope.imageSrc = data.url;
                            $scope.titleText = data.contract;
                            if (data.cycletype == 0) {
                                $scope.period = "日K线";
                            } else if (data.cycletype == 1) {
                                $scope.period = "5分钟线";
                            }
                        }
                        else if (data.return_code == '20006') {
                            $rootScope.$broadcast('Login:loginTimeOut');
                        }
                    }, function (err) {
                        BusyService.hide();
                    })
                    $scope.blooean = true;
                }

                $scope.fwList = $scope.starInfo;

            }
            if (data.return_code == '20006') {
                $rootScope.$broadcast('Login:loginTimeOut');
            }
        }, function (err) {
            BusyService.hide();

        });


        $scope.checkUserIsBuy = function () {
            BusyService.show();
            if ($scope.addfilepdf != null && $scope.addfilepdf != "" && $scope.addfilepdf != "undefined") {
                openFile($scope.addfilepdf);
            } else {
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: "报告文件不存在",
                    okText: '确定'
                });
            }

        };
        function openFile(url) {
            var devicePlatform = ionic.Platform.platform();
            switch (devicePlatform) {
                case 'android':
                    /**
                     * Android devices cannot open up PDFs in a sub web view (inAppBrowser) so the PDF needs to be downloaded and then opened with whatever
                     * native PDF viewer is installed on the app.
                     */
                    var urlArr = url.split(".");
                    var fileNameExten = urlArr[urlArr.length - 1];

                    var fileURL = cordova.file.externalApplicationStorageDirectory + "local." + fileNameExten;


                    var fileTransfer = new FileTransfer();
                    var uri = encodeURI(url);

                    fileTransfer.download(
                        uri,
                        fileURL,
                        function (entry) {
                            BusyService.hide();
                            window.pdf.openPdf(
                                function (results) {
                                }, function (error) {
                                }, entry.toURL()
                            );
                        },
                        function (error) {
                            BusyService.hide();
                        },
                        false
                    );
                    break;
                default:
                    BusyService.hide();
                    /**
                     * IOS and browser apps are able to open a PDF in a new sub web view window. This uses the inAppBrowser plugin
                     */
                    var ref = window.open(url, '_blank', 'location=no,toolbar=yes,closebuttoncaption=Close PDF,enableViewportScale=yes');
                    break;
            }
        }

    }])

    .controller('ChatTabCtrl', ['$scope','$q','$state',function($scope,$q,$state){
        $scope.data = {
            badgeCount : 0
        };
        $scope.$on('chatTabUnReadCount',function(d,data){
            $scope.data.badgeCount = data;
        });
        $scope.isVisitor = function() {
            $state.go('tab.chat2');
            /*if(isVisitor) {
             $state.go('signin');
             }else {
             $state.go('tab.chats');
             }*/
        }
    }])
    .controller('WoTabCtrl', ['$scope','$q','$state',function($scope,$q,$state){
        $scope.isVisitor = function() {
            if(isVisitor) {
                $state.go('signin');
            }else {
                $state.go('tab.wo');
            }
        }
    }])
    .controller('ChatsCtrl', ['$timeout', 'BusyService', '$rootScope', '$scope', '$localstorage', 'webLocalDB','wsService', function ($timeout, BusyService, $rootScope, $scope, $localstorage, webLocalDB, wsService) {
        var user2 = $localstorage.getObject('user');
        $scope.myId = user2.id;
        $scope.businessUserId = user2.businessUserId;
        $scope.businessUserName = user2.businessUserName;
        $scope.businessUserAvatar = user2.businessUserAvatar;

        $scope.chats = [];
        $scope.$on('$ionicView.enter', function () {
            wsService.init(chatUrl + "/Sns/websocket");
            var user2 = $localstorage.getObject('user');
            var chatUser = {
                userId: $localstorage.getObject('user').businessUserId.toString(),
                badge: 0,
                lastMessage: '',
                lastTime: '',
                ownUser: '' + user2.id.toString()
            };
            BusyService.show();
            webLocalDB.insertChatUser(chatUser);
            $timeout(selectChatUser(), 250);
        });

        function selectChatUser() {
            webLocalDB.selectChatUser($scope.myId, selectChatUserResult);
        }

        function selectChatUserResult(tx, result) {
            BusyService.hide();
            var rowList = result.rows;

            for (var i = 0; i < rowList.length; i++) {
                var row = rowList.item(i);
                var chatUser = {};
                for (var j in row) {
                    if (j == 'userId') {
                        chatUser.userId = row[j];
                    }
                    if (j == 'badge') {
                        chatUser.badge = row[j];
                    }
                    if (j == 'lastMessage') {
                        var message = row[j];
                        if (message.length > 9) {

                            message = message.slice(0, 9) + '...';
                        }
                        chatUser.lastMessage = message;
                    }
                    if (j == 'lastTime') {
                        chatUser.lastTime = row[j];
                    }
                    if (j == 'ownUser') {
                        chatUser.ownUser = row[j];
                    }
                }
                var cc = [{
                    id: chatUser.userId,
                    name: $scope.businessUserName,
                    lastMessage: chatUser.lastMessage,
                    headImg: $scope.businessUserAvatar,
                    badge: chatUser.badge,
                    lastTime: chatUser.lastTime
                }];
                if ($scope.chats.length == 0) {
                    $scope.chats = cc;
                } else if ($scope.chats[0].id != cc[0].id) {
                    $scope.chats = cc;
                }
                $scope.chatTabUnReadCount += chatUser.badge;
                $scope.$emit('chatTabUnReadCount', $scope.chatTabUnReadCount);
            }
        }

        $scope.clearChatUserBadge = function () {
            webLocalDB.clearChatUserBadge($scope.businessUserId);
            for (var i = 0; i < $scope.chats.length; i++) {
                var chat = $scope.chats[i];
                if (chat.userId == $scope.businessUserId) {
                    $scope.chatTabUnReadCount -= $scope.chats[i].badge;
                    $scope.$emit('chatTabUnReadCount', $scope.chatTabUnReadCount);
                    $scope.chats[i].badge = 0;
                }
            }
        }

    }])
    .controller('ChatsDetailCtrl', ['wsService', 'BusyService', '$ionicPopup', '$rootScope', '$filter', 'RemoteService', '$scope', '$timeout', '$interval', '$localstorage', '$ionicScrollDelegate', 'webLocalDB', 'Chats', 'UUIDFac', function (wsService, BusyService, $ionicPopup, $rootScope, $filter, RemoteService, $scope, $timeout, $interval, $localstorage, $ionicScrollDelegate, webLocalDB, Chats, UUIDFac) {
        var db = webLocalDB.getDb();
        $scope.messages = [];


        $scope.$on('$ionicView.enter', function () {
            $scope.index = 0;
            var user2 = $localstorage.getObject('user');

            $scope.myId = user2.id;
            $scope.businessUserId = user2.businessUserId;
            $scope.data = {};
            $scope.chat = {};
            $scope.messages = [];
            $scope.newTalk = 1;
            BusyService.show();
            db.transaction(selectChatCallBack);
        });

        $scope.sendMessage = function () {
            if ($scope.chat.message != '' && $scope.chat.message != undefined) {
                var d = new Date();
                var d = $filter('date')(d, 'yyyy-MM-dd HH:mm:ss');

                $scope.messages.push({
                    userId: $scope.myId,
                    text: $scope.chat.message,
                    time: d
                });
                var addChat = {};
                var addMessage = $scope.chat.message;

                addChat.id = UUIDFac.getUUID().id;
                addChat.userId = $localstorage.getObject('user').id.toString();
                addChat.sessionId = $localstorage.getObject('user').sessionId.toString();
                addChat.info = addMessage;
                addChat.time = d;
                addChat.ownUser = $scope.myId.toString();
                addChat.businessUserId = $scope.businessUserId.toString();
                addChat.isSendSuccess = 1;
                webLocalDB.insertChat(addChat);
                wsService.send(addChat);
                $scope.index = $scope.index + 1;

                delete $scope.chat.message;
                $ionicScrollDelegate.scrollBottom(true);
            }

        };


        $rootScope.$on('wsService:onmessage', function (event, message) {
            var data = message.data;
            try {
                var rm = angular.fromJson(data);

                if (angular.isArray(rm)) {

                    angular.forEach(rm, function (value, key) {
                        $timeout(addRemoteMessage(value));

                    })
                } else if (angular.isObject(rm)) {


                    if (rm.return_code == '20006') {
                        $scope.$broadcast('scroll.refreshComplete');
                        $rootScope.$broadcast('Login:loginTimeOut', function () {
                            $ionicPopup.alert({
                                title: '提示',
                                template: "发送超时，请重新发送！",
                                okText: '确定'
                            });
                        });

                    } else if (rm.return_code == '200') {

                    } else if (rm.return_code == '20004') {
                        $ionicPopup.alert({
                            title: '提示',
                            template: "发送失败，请重试！",
                            okText: '确定'
                        });
                    } else {
                        $timeout(addRemoteMessage(rm));

                    }

                }
            } catch (exception) {
            }
        });
        function addRemoteMessage(rm) {
            var chat = {};
            chat.id = rm.id.toString();
            chat.userId = rm.businessUserId.toString();
            chat.info = rm.info;
            chat.message = rm.info;
            chat.time = $filter('date')(rm.createTime, 'yyyy-MM-dd HH:mm:ss');
            chat.ownUser = $scope.myId.toString();
            chat.isSendSuccess = 1;
            webLocalDB.insertChat(chat);
            if (rm.type == 1) {
                var isNew = true;
                for (var k = 0; k < $scope.messages.length; k++) {
                    if ($scope.messages[k].time == chat.time) {
                        isNew = false;
                    }
                }
                if (isNew) {
                    $scope.messages.push({
                        userId: chat.userId,
                        text: chat.message,
                        time: chat.time
                    });
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.scrollBottom(true);

                }
            }
            $scope.index = $scope.index + 1;
        };


        //输入时
        $scope.inputUp = function () {
            $scope.data.keyboardHeight = 0;


        }

        //离开时
        $scope.inputDown = function () {
            $scope.data.keyboardHeight = 150;
            $timeout(function () {
                $ionicScrollDelegate.scrollBottom(true);
            }, 10);
            $scope.data.keyboardHeight = 0;
            $ionicScrollDelegate.resize();
        }


        function selectChatCallBack(tx) {
            // var sql = "select * from chat where ownUser = " + $scope.myId + " order by rowid desc limit 20 offset 0;";
            var sql = "select id,userId,message,time,ownUser,isSendSuccess from chat where ownUser = " + $scope.myId + " order by rowid desc limit 20 offset 0;";
            tx.executeSql(sql, [], selectChatQueryResult, queryError);
        }

        function selectChatQueryResult(tx, result) {
            var rowList = result.rows;
            for (var i = 0; i < rowList.length; i++) {
                var row = rowList.item(i);
                var chat = {};
                for (var j in row) {
                    if (j == 'userId') {
                        chat.userId = row[j];
                    }
                    if (j == 'message') {
                        chat.message = row[j];
                    }
                    if (j == 'time') {
                        chat.time = row[j];
                    }

                }
                $scope.messages.unshift({
                    userId: chat.userId,
                    text: chat.message,
                    time: chat.time
                });
            }
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollBottom(true);
            BusyService.hide();
            $scope.index = rowList.length;
        }

        function queryError(tx, err) {

        }

        $scope.doRefresh = function () {
            $timeout(function () {
                $scope.$broadcast('scroll.refreshComplete');
                db.transaction(selectChatCallBack2);
                function selectChatCallBack2(tx) {
                    var limitEnd = $scope.index + 20;
                    //var sql = "select * from chat where ownUser = " + $scope.myId + " order by time desc limit 20 offset "+ $scope.index +";";
                    var sql = "select id,userId,message,time,ownUser,isSendSuccess from chat where ownUser = " + $scope.myId + " order by time desc limit 20 offset " + $scope.index + ";";
                    tx.executeSql(sql, [], selectChatRefreshQueryResult, queryError);
                }

                function selectChatRefreshQueryResult(tx, result) {
                    var rowList = result.rows;
                    for (var i = 0; i < rowList.length; i++) {
                        var row = rowList.item(i);
                        var chat = {};
                        for (var j in row) {
                            if (j == 'userId') {
                                chat.userId = row[j];
                            }
                            if (j == 'message') {
                                chat.message = row[j];
                            }
                            if (j == 'time') {
                                chat.time = row[j];
                            }

                        }
                        $scope.messages.unshift({
                            userId: chat.userId,
                            text: chat.message,
                            time: chat.time
                        });
                    }
                    $scope.index = $scope.index + rowList.length;
                }
            }, 1000);

        };


    }])
    //交易
    .controller('JyCtrl', ['$scope', function ($scope) {
        $scope.message = '尚未开通，请稍候...';
    }])
    //开户
    .controller('ScCtrl', ['$scope', function ($scope) {
        $scope.message = '尚未开通，请稍候...';


    }])
    //收藏
    .controller('KhCtrl', ['$scope', function ($scope) {
        $scope.message = '尚未开通，请稍候...';
    }])
    .controller('Chat2Ctrl', ['$scope',function($scope){
        $scope.message = '建设中，敬请期待...';
    }])
    /**
     * 我
     */
    .controller('WoCtrl', ['$localstorage', '$scope', function ($localstorage, $scope) {
        $scope.$on('$ionicView.enter',function(){
            $scope.user = $localstorage.getObject('user');
            $scope.currentUser = $localstorage.getObject($scope.user.id);
            //$scope.user.avatarUrl = $localstorage.getObject($scope.user.avatarUrl);
        });

    }])
    /**
     * 推荐业务员
     */
    .controller('TjywyCtrl', ['$rootScope', 'JpushService', 'BusyService', 'webLocalDB', '$state', '$ionicPopup', '$localstorage', 'RemoteService', '$scope', function ($rootScope, JpushService, BusyService, webLocalDB, $state, $ionicPopup, $localstorage, RemoteService, $scope) {
        var user2 = $localstorage.getObject('user');
        $scope.myId = user2.id;
        $scope.ywys = RemoteService.allTjywy({sessionId: $localstorage.getObject('user').sessionId}, function (data) {
            if (data.return_code == '20006') {
                BusyService.hide();
                $scope.$broadcast('scroll.refreshComplete');
                $rootScope.$broadcast('Login:loginTimeOut');
            }
        }, function (err) {
            BusyService.hide();
            $ionicPopup.alert({
                title: '提示',
                template: "加载失败，请重试！",
                okText: '确定'
            });
        });

        $scope.data = {
            ywy: ''
        }
        $scope.bindYwy = function () {
            BusyService.show();
            var userBindInfo = {};
            userBindInfo['sessionId'] = $localstorage.getObject('user').sessionId;
            userBindInfo['businessUserId'] = $scope.data.ywy;
            RemoteService.addBusinessByUserId(userBindInfo, function (data) {
                BusyService.hide();
                if (data.return_code == '200') {
                    $scope.businessUserFlag = true;
                    $scope.businessUserName = data.data.businessUserName;
                    $scope.businessUserAvatar = data.data.businessUserAvatar;

                    user2.businessUserId = data.data.businessUserId;
                    user2.businessUserName = data.data.businessUserName;
                    user2.businessUserAvatar = data.data.businessUserAvatar;
                    user2.isActivation = data.data.isActivation;
                    user2.sessionId = data.data.sessionId;
                    user2.id = data.data.id;
                    $localstorage.setObject('user', user2);

                    var chatUser = {
                        userId: user2.businessUserId.toString(),
                        badge: 0,
                        lastMessage: '',
                        lastTime: '',
                        ownUser: '' + user2.id.toString()
                    };
                    webLocalDB.insertChatUser(chatUser);

                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '绑定成功！',
                        okText: '确定'
                    });
                    alertPopup.then(function (res) {
                        $state.go(
                            'tab.fw'
                        );
                    })
                }
                if (data.return_code == '20006') {
                    BusyService.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $rootScope.$broadcast('Login:loginTimeOut');
                }

            }, function (err) {
                BusyService.hide();
                $ionicPopup.alert({
                    title: '提示',
                    template: "加载失败，请重试！",
                    okText: '确定'
                });
            });

        }
    }])
    //初始化操作
    .run(['$interval', '$ionicLoading', '$ionicPlatform', '$rootScope', '$ionicHistory', '$state', '$ionicPopup', '$window', 'JpushService', 'BusyService', 'wsService', function ($interval, $ionicLoading, $ionicPlatform, $rootScope, $ionicHistory, $state, $ionicPopup, $window, JpushService, BusyService, wsService) {
        $ionicPlatform.ready(function () {


            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {

                StatusBar.styleDefault();
            }

            //检测更新
            //checkUpdate();

            $rootScope.$on('loading:show', function () {

            })
            $rootScope.$on('loading:hide', function () {

            })

            JpushService.init();
            wsService.init(chatUrl + "/Sns/websocket");

            $ionicPlatform.registerBackButtonAction(function (e) {
                // BusyService.hide();
                function showConfirm() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '<strong>退出程序?</strong>',
                        template: '你确定要退出吗?',
                        cancelText: '取消',
                        okText: '确定'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            if (angular.isDefined($rootScope.stopChat)) {
                                $interval.cancel($rootScope.stopChat);
                                $rootScope.stopChat = undefined;
                            }
                            if (angular.isDefined($rootScope.stop)) {
                                $interval.cancel($rootScope.stop);
                                $rootScope.stop = undefined;
                            }
                            $window.localStorage['lastExitTime'] = new Date();
                            $window.localStorage['lastRequestTime'] = new Date();
                            $window.localStorage['lastExitTime'] = new Date();
                            ionic.Platform.exitApp();
                        } else {

                        }
                    });
                }

                if ($state.current.name == "tab.fw" || $state.current.name == "signin") {
                    showConfirm();
                } else if ($state.current.name == 'tab.fwlist') {
                    $state.go('tab.fw');
                }
                else {
                    BusyService.hide();
                    navigator.app.backHistory();
                }
                return false;
            }, 101);

        });


        // 检查更新
        //function checkUpdate() {
        //    //获取本能版本和渠道
        //    $cordovaAppVersion.getAppVersion().then(function (version_channel) {
        //
        //        var strs = version_channel.split(";");
        //        var version = strs[0];
        //        var channel = strs[1];
        //        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!channel!version" + version + ";;" + channel);
        //        //BusyService.show();
        //        RemoteService.updateApp({
        //            /* version platform channel*/
        //            version: version,
        //            platform: 1,
        //            channel: channel,
        //            // sessionId: $localstorage.getObject('user').sessionId.toString()
        //        }, function (data) {
        //            // BusyService.hide();
        //            if (data.return_code == '200') {
        //                /* hasnew version updateTime fixbug newfeature url*/
        //                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!data" + angular.toJson(data, true));
        //                if (data.hasnew == 1) {
        //                    showUpdateConfirm(data.version, data.updateTime, data.fixbug, data.newfeature, data.url);
        //                }
        //            }
        //            else if (data.return_code == '20006') {
        //                $rootScope.$broadcast('Login:loginTimeOut');
        //            } else {
        //                $ionicPopup.alert({
        //                    title: '提示',
        //                    template: data.message,
        //                    okText: '确定'
        //                });
        //            }
        //        }, function (err) {
        //            //BusyService.hide();
        //            $ionicPopup.alert({
        //                title: '提示',
        //                template: "加载失败，请重试！",
        //                okText: '确定'
        //            });
        //        })
        //    });
        //
        //
        //    // 显示是否更新对话框
        //    function showUpdateConfirm(newVersion, updateTime, fixbug, newfeature, url) {
        //        var confirmPopup = $ionicPopup.confirm({
        //            title: '最新版本' + newVersion + '升级',
        //            template: '一、修复的问题：</br>' + fixbug + ';</br>二、最新的功能：</br>' + newfeature + ';</br>', //从服务端获取更新的内容
        //            cancelText: '取消',
        //            okText: '升级'
        //        });
        //        confirmPopup.then(function (res) {
        //            if (res) {
        //                $ionicLoading.show({
        //                    template: "已经下载：0%"
        //                });
        //
        //                //var url = "http://192.168.56.1:8080/1.apk"; //可以从服务端获取更新APP的路径
        //                //var url = "http://10.2.6.22:8080/1.apk"; //可以从服务端获取更新APP的路径
        //                //var targetPath = "file:///storage/sdcard0/Download/1.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配置
        //                var targetPath = cordova.file.externalApplicationStorageDirectory + "local.apk";
        //                console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~targetPath:" + targetPath);
        //                var trustHosts = true;
        //                var options = {};
        //                $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
        //                    // 打开下载下来的APP
        //                    $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
        //                    ).then(function () {
        //                    }, function (err) {
        //                    });
        //                    $ionicLoading.hide();
        //                }, function (err) {
        //                    alert('下载失败');
        //                }, function (progress) {
        //                    //进度，这里使用文字显示下载百分比
        //                    $timeout(function () {
        //                        var downloadProgress = (progress.loaded / progress.total) * 100;
        //                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~downloadProgress" + downloadProgress);
        //                        $ionicLoading.show({
        //                            template: "已经下载：" + Math.floor(downloadProgress) + "%"
        //                        });
        //                        if (downloadProgress > 99) {
        //                            $ionicLoading.hide();
        //                        }
        //                    })
        //                });
        //            } else {
        //                // 取消更新
        //            }
        //        });
        //    }
        //}

    }])
    //定义input标签
    .directive('input', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                'returnClose': '=',
                'onReturn': '&',
                'onFocus': '&',
                'onBlur': '&'
            },
            link: function (scope, element, attr) {
                element.bind('focus', function (e) {
                    if (scope.onFocus) {
                        $timeout(function () {
                            scope.onFocus();
                        });
                    }
                });
                element.bind('blur', function (e) {
                    if (scope.onBlur) {
                        $timeout(function () {
                            scope.onBlur();
                        });
                    }
                });
                element.bind('keydown', function (e) {
                    if (e.which == 13) {
                        if (scope.returnClose) element[0].blur();
                        if (scope.onReturn) {
                            $timeout(function () {
                                scope.onReturn();
                            });
                        }
                    }
                });
            }
        }
    }])
    //定义合同标签
    .directive('myContract', [function () {

        function link(scope, element, attrs) {
            //var s= "<div style='color:#00FF00'><h3>This is a header</h3><p>This is a paragraph.</p></div>"
            var str = scope.content;
            element.html(str);
        }

        return {
            link: link
        };
    }])

    //过滤成能ng-bind-html识别的html
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        var androidConfig = {
            tabs: {
                style: 'standard',
                position: 'bottom'
            }
        };
        $ionicConfigProvider.setPlatformConfig('android', androidConfig);
        //默认路径
        $urlRouterProvider.otherwise('sign-in');
        $stateProvider
            .state('signin',{
                url:"/sign-in",
                templateUrl: 'templates/sign-in.html',
                controller: 'SignInCtrl'
            })
            .state('accountloginin',{
                url:"/accountloginin/:paramId",
                templateUrl: 'templates/account-login-in.html',
                controller: 'AccountInCtrl',
                cache: false
            })
            .state('balanceParams',{
                url:"/balanceParams",
                templateUrl: 'templates/balance-params.html',
                controller: 'balanceParamsCtrl'
            })
            .state('balanceChart',{
                url:"/balanceChart",
                templateUrl: 'templates/balance-chart.html',
                controller: 'balanceChartCtrl'
            })
            .state('performanceParams',{
                url:"/performanceParams",
                templateUrl: 'templates/performance-params.html',
                controller: 'performanceParamsCtrl'
            })
            .state('performanceTable',{
                url:"/performanceTable",
                templateUrl: 'templates/performance-table.html',
                controller: 'performanceTableCtrl'
            })
            .state('pd',{
                url : '/pd',
                templateUrl: 'templates/pd-lists.html',
                controller: 'pdlCtrl',
                cache: false
            })
            .state('contracts',{
                url : '/contracts/:conId',
                templateUrl: 'templates/contracts.html',
                controller: 'conCtrl',
                cache: false
            })
            .state('signup', {
                url: '/sign-up',
                templateUrl: 'templates/sign-up.html',
                controller: 'SignUpCtrl'
            })
            .state('forgotpassword', {
                url: '/forgot-password',
                controller: 'ForgotPasswordCtrl',
                templateUrl: 'templates/forgot-password.html'
            })
            .state('tjywy', {
                url: '/tj-ywy',
                controller: 'TjywyCtrl',
                templateUrl: 'templates/tj-ywy.html'
            })

            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })


            .state('tab.fw', {
                url: '/fw',
                views: {
                    'tab-fw': {
                        templateUrl: 'templates/tab-fw.html',
                        controller: 'FwCtrl'
                    }
                }

            })
            .state('tab.fwlist',{
                url: '/fwl/:fwId',
                views: {
                    'tab-fw': {
                        templateUrl: 'templates/fw-list.html',
                        controller: 'FwListCtrl'
                    }

                }
            })
            .state('tab.fwlcal',{
                url: '/fwlcal',
                views: {
                    'tab-fw': {
                        templateUrl: 'templates/fw-list-cal.html',
                        controller: 'FwListCalCtrl'
                    }
                }
            })

            .state('tab.fwdetail',{
                url: '/fws/fwdetail/:fwListId/:starId/:fwCategory/:fweStarUserId',
                views: {
                    'tab-fw': {
                        templateUrl:'templates/fw-detail.html',
                        controller: 'FwDetailCtrl'
                    }
                }
            })

            .state('tab.jy', {
                url: '/jy',
                views: {
                    'tab-jy': {
                        templateUrl: 'templates/tab-jy.html',
                        controller: 'JyCtrl'
                    }
                }
            })
            .state('tab.sc',{
                url : '/sc',
                views: {
                    'tab-sc': {
                        templateUrl: 'templates/tab-sc.html',
                        controller: 'ScCtrl'
                    }
                }
            })
            .state('tab.kh',{
                url : '/kh',
                views:{
                    'tab-kh': {
                        templateUrl: 'templates/tab-kh.html',
                        controller: 'KhCtrl'
                    }
                }
            })
            .state('tab.chat2',{
                url : '/chat2',
                views:{
                    'tab-chatbox': {
                        templateUrl: 'templates/tab-chat2.html',
                        controller: 'Chat2Ctrl'
                    }
                }
            })

            .state('tab.chats',{
                url : '/chats',
                views:{
                    'tab-chatbox': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })
            .state('chat',{
                url : '/chats/:chatId',
                templateUrl: 'templates/chat-detail.html',
                controller: 'ChatsDetailCtrl'
            })

            .state('tab.wo',{
                url : '/wo',
                //templateUrl: 'templates/tab-wo.html',
                //controller: 'WoCtrl'
                views:{
                    'tab-wo': {
                        templateUrl: 'templates/tab-wo.html',
                        controller: 'WoCtrl'
                    }
                }
            })

            .state('tab.wo-person',{
                url : '/person',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-person.html',
                        controller: 'PersonCtrl'
                    }
                }
            })

            .state('tab.wo-person-nicename',{
                url : '/nicename',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-person-nicename.html',
                        controller: 'NicenameCtrl'
                    }
                }
            })

            .state('tab.wo-person-password',{
                url : '/repassword',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-person-password.html',
                        controller: 'RepasswordCtrl'
                    }
                }
            })

            .state('tab.wo-password',{
                url : '/password',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-password.html',
                        controller: 'PasswordCtrl'
                    }
                }
            })

            .state('wo-storeup',{
                url : '/storeup',
                templateUrl: 'templates/wo-storeup.html',
                controller: 'StoreupCtrl'
            })

            .state('wo-storeup-content',{
                url : '/storeupcontent/:storeUpId',
                templateUrl: 'templates/wo-storeup-content.html',
                controller: 'StoreupContentCtrl'
            })

            .state('wo-storeup-add',{
                url : '/storeupadd',
                templateUrl: 'templates/wo-storeup-add.html',
                controller: 'StoreupAddCtrl'
            })

            .state('tab.wo-buser',{
                url : '/buser',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-buser.html',
                        controller: 'BuserCtrl',
                    }
                },
                cache: false
            })

            .state('tab.wo-setting',{
                url : '/setting',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })

            .state('tab.wo-about',{
                url : '/about',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-setting-about.html',
                        controller: 'SettingAboutCtrl'
                    }
                }
            })

            .state('tab.wo-opinion',{
                url : '/opinion',
                views: {
                    'tab-wo': {
                        templateUrl: 'templates/wo-setting-opinion.html',
                        controller: 'SettingOpinionCtrl'
                    }
                }
            })
        ;
    }]);