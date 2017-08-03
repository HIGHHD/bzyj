//
//  CofcoStarIF.m
//  BaiZhanYing
//
//  Created by zlqhjs on 16/3/18.
//
//

#import "CofcoStarIF.h"

@implementation CofcoStarIF

- (void)getStarInfo:(CDVInvokedUrlCommand *)command {
    NSArray *msgArray = command.arguments;
    NSLog(@"%@,%lu",msgArray,(unsigned long)msgArray.count);
    for (NSObject *ele in msgArray) {
        if ([ele isKindOfClass:[NSNull class]]) {
            return;
        }
    }
    IAPayViewController *iapVC = [[IAPayViewController alloc]init];
    
    StarInfo *payStarInfo = [[StarInfo alloc] init];
    payStarInfo.eStarUserId = msgArray[0];
    payStarInfo.userId = msgArray[1];
    payStarInfo.starName = msgArray[2];
    payStarInfo.desc = msgArray[3];
    payStarInfo.pricePerMonth = [msgArray[4] intValue];
    payStarInfo.months = [msgArray[5] intValue];
    payStarInfo.buyPrice = [msgArray[6] intValue];
    payStarInfo.iapPriceId = msgArray[7];
    payStarInfo.serverIp = msgArray[8];
    
    iapVC.payStarInfo = payStarInfo;
    iapVC.title = @"开通VIP";
    //有个警告，内存消耗大，使用主线程推出界面
    dispatch_async(dispatch_get_main_queue(), ^{
        
        UINavigationController *nav = [[UINavigationController alloc]initWithRootViewController:iapVC];
        
        nav.navigationBar.barStyle = UIBarStyleBlack;
        [nav.navigationBar setTintColor:[UIColor whiteColor]];
        [self.viewController presentViewController:nav animated:YES completion:nil];
        
    });
}

@end
