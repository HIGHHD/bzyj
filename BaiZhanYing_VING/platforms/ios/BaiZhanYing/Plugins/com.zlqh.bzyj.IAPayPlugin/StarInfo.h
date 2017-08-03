//
//  PayModel.h
//  IAPTest
//
//  Created by zlqhjs on 16/3/15.
//  Copyright © 2016年 zlqhjs. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface StarInfo : NSObject

@property (nonatomic, strong) NSString *eStarUserId;
@property (nonatomic, strong) NSString *userId;
@property (nonatomic, strong) NSString *starName;
@property (nonatomic, strong) NSString *desc;
@property (nonatomic, assign) int pricePerMonth;
@property (nonatomic, assign) int months;
@property (nonatomic, assign) int buyPrice;
@property (nonatomic, strong) NSString *iapPriceId;
@property (nonatomic, strong) NSString *serverIp;

@end
