//
//  ACViewController.m
//  PayGround
//
//  Created by zlqhjs on 16/2/17.
//  Copyright © 2016年 zlqhjs. All rights reserved.
//

#import "LaunchOAC.h"

@interface LaunchOAC ()<MainViewDelegate>

@property (nonatomic, strong) MainViewController *vc;

@end

@implementation LaunchOAC

- (void)presentOAC:(CDVInvokedUrlCommand *)command {

    //有个警告，内存消耗大，使用主线程推出界面
    dispatch_async(dispatch_get_main_queue(), ^{
        
        self.vc = [[MainViewController alloc] init];
        self.vc.delegate = self;
        self.vc.checkBrokerIdFlag = @"false";
        self.vc.brokerId = @"0221";
        [self.viewController presentViewController:self.vc animated:YES completion:nil];
        
    });
}

- (void)quitSjkh {

    [self.vc dismissViewControllerAnimated:YES completion:nil];
}

@end
