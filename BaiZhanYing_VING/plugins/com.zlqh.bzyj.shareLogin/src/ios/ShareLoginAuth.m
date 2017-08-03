//
//  ShareLoginAuth.m
//  UMSocialDemo
//
//  Created by zlqhjs on 2017/1/3.
//  Copyright © 2017年 Umeng. All rights reserved.
//

#import "ShareLoginAuth.h"

@interface ShareLoginAuth() <NSCopying>
@property (nonatomic, strong) CDVInvokedUrlCommand *command;
@property (nonatomic, strong) TencentOAuth *tencentOAuth;
@end

@implementation ShareLoginAuth
    
static ShareLoginAuth *_single = nil;
    
+ (instancetype)allocWithZone:(struct _NSZone *)zone {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _single = [super allocWithZone: zone];
    });
    return _single;
}
- (id)copyWithZone:(NSZone *)zone {
    return _single;
}
    
+ (BOOL)shareLoginOpenURL:(NSURL *)url {
    //因为这里会重新初始化，导致不能传参，用单例
    if ([WXApi handleOpenURL:url delegate:[[self alloc] init]]) {
        return YES;
    } else if ([TencentOAuth HandleOpenURL:url]) {
        return YES;
    } else {
        return NO;
    }
}
    
+ (void)initShareLogin: (UIApplication *)application WithOption:(NSDictionary *)launchOptions {
    
    [WXApi registerApp:@"wx7c7188837055a79d" withDescription:@"bzyj"];
}
    
- (void)wechatLogin:(CDVInvokedUrlCommand *)command {
    
    self.command = command;
    SendAuthReq* req = [[SendAuthReq alloc ] init];
    req.scope = @"snsapi_userinfo";
    if (command.arguments.count == 0) {
        [WXApi sendReq:req];
    } else {
        req.state = command.arguments[0];
        [WXApi sendReq:req];
    }
}
- (void)qqLogin:(CDVInvokedUrlCommand *)command {
    
    self.command = command;
    NSArray* permissions = [NSArray arrayWithObjects:
                            kOPEN_PERMISSION_GET_USER_INFO,
                            kOPEN_PERMISSION_GET_SIMPLE_USER_INFO,
                            kOPEN_PERMISSION_GET_INFO,
                            nil];
    TencentOAuth *tencentOAuth = [[[TencentOAuth alloc] init] initWithAppId:@"1105332426" andDelegate:self];
    self.tencentOAuth = tencentOAuth;
    
    [tencentOAuth authorize:permissions];

}

- (void)onResp:(BaseResp *)resp {
    //因为在微信handle的时候有一个init本对象的过程，导致self.command没有了
    dispatch_queue_t qqres = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(qqres, ^{
        SendAuthResp *res = (SendAuthResp *)resp;
        if (res.errCode == 0) {
            CDVPluginResult * result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:res.code];
            [self.commandDelegate sendPluginResult:result callbackId:_command.callbackId];
        } else {
            CDVPluginResult * result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"取消登录"];
            [self.commandDelegate sendPluginResult:result callbackId:_command.callbackId];
        }
    });
}
    
- (void)tencentDidLogin {
    
    [self.tencentOAuth getUserInfo];
}

- (void)tencentDidNotNetWork {

    dispatch_queue_t qqres = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(qqres, ^{
        CDVPluginResult * result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"网络设置有误"];
        [self.commandDelegate sendPluginResult:result callbackId:_command.callbackId];
    });
}

- (void)tencentDidNotLogin:(BOOL)cancelled {
    dispatch_queue_t qqres = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(qqres, ^{
        CDVPluginResult * result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"取消登录"];
        [self.commandDelegate sendPluginResult:result callbackId:_command.callbackId];
    });
}
    
- (void)getUserInfoResponse:(APIResponse *)response {
    dispatch_queue_t qqres = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(qqres, ^{
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        dateFormatter.dateFormat = @"yyyyMMddhhmmss";
        NSString *dateStr = [dateFormatter stringFromDate:self.tencentOAuth.expirationDate];
        NSDictionary *dic = @{@"openid": self.tencentOAuth.openId,
                              @"accessToken": self.tencentOAuth.accessToken,
                              @"expireDate": dateStr,
                              @"userInfo": response.jsonResponse
                              };
        CDVPluginResult * result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dic];
        [self.commandDelegate sendPluginResult:result callbackId:_command.callbackId];
    });
}
@end
