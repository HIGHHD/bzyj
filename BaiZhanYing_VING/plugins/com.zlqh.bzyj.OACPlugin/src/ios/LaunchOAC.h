//
//  ACViewController.h
//  PayGround
//
//  Created by zlqhjs on 16/2/17.
//  Copyright © 2016年 zlqhjs. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Cordova/CDV.h>
#import <HsOpenAccountFramework/HsOpenAccountFramework.h>

@interface LaunchOAC : CDVPlugin

- (void)presentOAC:(CDVInvokedUrlCommand *)command;

@end
