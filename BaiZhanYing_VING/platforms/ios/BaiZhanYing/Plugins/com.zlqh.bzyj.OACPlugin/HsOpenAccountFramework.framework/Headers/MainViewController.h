//
//  MainViewController.h
//  crh-sjkh
//
//  Created by milo on 14-3-24.
//  Copyright (c) 2014年 com.cairh. All rights reserved.
//


#import <UIKit/UIKit.h>
#import<HsOpenAccountFramework/MainViewController.h>

@protocol MainViewDelegate <NSObject>

@optional

-(void)quitSjkh;

@end

@interface MainViewController : UIViewController

@property (nonatomic,assign) id<MainViewDelegate> delegate;
@property (strong, nonatomic) UIWebView* myWebView;
@property (strong, nonatomic) UIImageView* imgView;

 //注册手机号，第三方嵌入时如果要传入手机号 用此方法（手机号已经在第三方客户端获取）
@property (nonatomic, copy) NSString * mobileNo;
@property (nonatomic, copy) NSString * channel;
@property (nonatomic, copy) NSString * type;
@property (nonatomic, copy) NSString * username;
@property (nonatomic, copy) NSString * password;
@property (nonatomic ,copy) NSString * pictureFormat;

@property (nonatomic,strong)NSString * phoneNumber;
@property (nonatomic,strong)NSString * parChannel;

// add by xuxb 20160627
@property (nonatomic, strong)NSString *brokerId;   // 添加期货公司标识，跳过期货公司填写步骤
@property (nonatomic, strong)NSString *openType;
@property (nonatomic, strong)NSString *checkBrokerIdFlag;
// end add by xuxb 20160627

- (void)requstSuccess:(NSString*)result;
- (void)requstFail:(NSString*)err;
- (void)callHtmlJS:(NSString*)js;

-(void)backHomePage;

- (NSString *) picType;
- (NSString *) cookieStr;


@property(nonatomic,assign,getter =isAuthed)BOOL authed;
@property(nonatomic,strong)NSURL *currenURL;



@end
