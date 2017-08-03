//
//  ShareLoginAuth.h
//  UMSocialDemo
//
//  Created by zlqhjs on 2017/1/3.
//  Copyright © 2017年 Umeng. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Cordova/CDV.h>
#import "WXApi.h"
#import "WXApiObject.h"
#import "WechatAuthSDK.h"
#import <TencentOpenAPI/QQApiInterface.h>
#import <TencentOpenAPI/QQApiInterfaceObject.h>
#import <TencentOpenAPI/sdkdef.h>
#import <TencentOpenAPI/TencentOAuth.h>
#import <TencentOpenAPI/TencentOAuthObject.h>

@interface ShareLoginAuth : CDVPlugin <WXApiDelegate, TencentSessionDelegate>

- (void)wechatLogin:(CDVInvokedUrlCommand *)command;
- (void)qqLogin:(CDVInvokedUrlCommand *)command;
+ (BOOL)shareLoginOpenURL:(NSURL *)url;
+ (void)initShareLogin: (UIApplication *)application WithOption:(NSDictionary *)launchOptions;

@end
