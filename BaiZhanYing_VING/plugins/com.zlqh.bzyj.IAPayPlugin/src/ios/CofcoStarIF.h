//
//  CofcoStarIF.h
//  BaiZhanYing
//
//  Created by zlqhjs on 16/3/18.
//
//

#import <Cordova/CDV.h>
#import "StarInfo.h"
#import "IAPayViewController.h"

@interface CofcoStarIF : CDVPlugin

- (void)getStarInfo:(CDVInvokedUrlCommand *)command;

@end
