//
//  IAPayViewController.m
//  testtest
//
//  Created by zlqhjs on 16/3/17.
//  Copyright © 2016年 zlqhjs. All rights reserved.
//

#import "IAPayViewController.h"
#import <StoreKit/StoreKit.h>
#import "CellForBuildTableViewCell.h"
#import "AFNetworking.h"

@interface IAPayViewController ()<UITableViewDataSource, UITableViewDelegate, SKProductsRequestDelegate, SKPaymentTransactionObserver>

//订单号
@property (nonatomic, strong) NSString *orderNo;
//关于订单的时间
@property (nonatomic, strong) NSString *orderCreateTime;
@property (nonatomic, strong) NSString *orderExpireTime;
@property (nonatomic, strong) NSString *proStartTime;
@property (nonatomic, strong) NSString *proEndTime;
@property (nonatomic, strong) UIActivityIndicatorView *act;

@end

@implementation IAPayViewController

- (UIActivityIndicatorView *)act {
    if (!_act) {
        _act = [[UIActivityIndicatorView alloc] initWithFrame:CGRectMake(0, 0, 50, 50)];
        _act.center = self.view.center;
        _act.activityIndicatorViewStyle=UIActivityIndicatorViewStyleWhiteLarge;
        _act.color = [UIColor grayColor];
        _act.hidesWhenStopped = YES;
    }
    return _act;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
    
    self.navigationItem.hidesBackButton = YES;
    self.automaticallyAdjustsScrollViewInsets = NO;
    UIBarButtonItem *newBackButton = [[UIBarButtonItem alloc]initWithTitle:@"返回" style:UIBarButtonItemStylePlain target:self action:@selector(clickToBack)];
    self.navigationItem.leftBarButtonItem = newBackButton;
}

- (void)dealloc {
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

- (void)clickToBack {
    [self.navigationController dismissViewControllerAnimated:YES completion:nil];
}

#pragma 订单中的时间设置
- (void)getDateForOrder {
    //时间格式；
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc]init];
    [dateFormatter setDateFormat:@"yyyyMMddHHmmss"];
    //  先定义一个遵循某个历法的日历对象；
    NSCalendar *greCalendar = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    NSCalendarUnit unitFlags = NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
    //当前时间
    NSDate *dateNow = [NSDate date];
    //构造所需的时间
    self.orderCreateTime = [dateFormatter stringFromDate:dateNow];
    self.proStartTime = [dateFormatter stringFromDate:dateNow];
    self.orderExpireTime = [dateFormatter stringFromDate:[NSDate dateWithTimeIntervalSinceNow:60 * 30]];
    
    NSDateComponents *dateNowComponents = [greCalendar components:unitFlags fromDate:dateNow];
    
    NSInteger month = (dateNowComponents.month + self.payStarInfo.months);
    
    if (month > 12) {
        NSInteger i = month / 12;
        month = month % 12;
        dateNowComponents.year = dateNowComponents.year + i;
    }else{
        month = month;
    }
    dateNowComponents.month = month;
    
    NSDate *dateAfterMonths = [greCalendar dateFromComponents:dateNowComponents];
    self.proEndTime = [dateFormatter stringFromDate:dateAfterMonths];
}

#pragma mark -- tableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return 6;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    //cell中label的横线配置
    NSMutableAttributedString *attr = [self makeOldPriceText];
    CellForBuildTableViewCell *showCell = [tableView dequeueReusableCellWithIdentifier:@"pay1"];
    CellForBuildTableViewCell *payCell = [tableView dequeueReusableCellWithIdentifier:@"pay2"];
    if (indexPath.row < 5) {
        if (showCell == nil) {
            showCell = [[NSBundle mainBundle]loadNibNamed:@"CellForBuildTableViewCell" owner:nil options:nil][3];
            switch (indexPath.row) {
                case 0:
                    showCell.nameLabel.text = @"商品名称：";
                    showCell.infoLabel.text = self.payStarInfo.starName;
                    break;
                case 1:
                    showCell.nameLabel.text = @"商品描述：";
                    showCell.infoLabel.text = self.payStarInfo.desc;
                    break;
                case 2:
                    showCell.nameLabel.text = @"使用期限：";
                    showCell.infoLabel.text = [NSString stringWithFormat:@"%d个月",self.payStarInfo.months];
                    break;
                case 3:
                    showCell.nameLabel.text = @"商品原价：";
                    [showCell.infoLabel setAttributedText:attr];
                    break;
                default:
                    showCell.nameLabel.text = @"优  惠  价：";
                    showCell.infoLabel.text = [NSString stringWithFormat:@"%.1f元",self.payStarInfo.buyPrice * 1.0];
                    break;
            }
        }
        [showCell setSelectionStyle:UITableViewCellSelectionStyleNone];
        return showCell;
    }else if (indexPath.row == 5) {
        
        if (payCell == nil) {
            payCell = [[NSBundle mainBundle]loadNibNamed:@"CellForBuildTableViewCell" owner:nil options:nil][4];
        }
        [payCell setSelectionStyle:UITableViewCellSelectionStyleBlue];
        return payCell;
    } else {
        return nil;
    }
}

- (NSMutableAttributedString *)makeOldPriceText {
    
    NSInteger oldPrice = self.payStarInfo.pricePerMonth * self.payStarInfo.months;
    NSString *oldPriceStr = [NSString stringWithFormat:@"%.1f元",oldPrice * 1.0];
    NSMutableAttributedString *attrStr = [[NSMutableAttributedString alloc]initWithString:oldPriceStr];
    NSUInteger length = [attrStr length];
    NSDictionary *attrDic = @{
                              NSStrikethroughStyleAttributeName : @(NSUnderlinePatternSolid | NSUnderlineStyleSingle),
                              NSStrikethroughColorAttributeName : [UIColor blackColor]
                              };
    [attrStr addAttributes:attrDic range:NSMakeRange(0, length)];
    return attrStr;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    if (indexPath.row == 5) {
        if ([SKPaymentQueue canMakePayments]) {
            [self makeOrder];
        } else {
            UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"支付提示" message:@"您已禁用该应用的应用内购买功能" preferredStyle:UIAlertControllerStyleAlert];
            UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleCancel handler:nil];
            [alert addAction:cancel];
            [self presentViewController:alert animated:YES completion:nil];
        }
    }
}
#pragma 生成订单
- (void)makeOrder {
    [self getDateForOrder];
    [self.act startAnimating];
    [self.view addSubview:self.act];
    NSString *orderNo = [self.payStarInfo.userId stringByAppendingString:self.orderCreateTime];
    self.orderNo = orderNo;
    NSString *urlStr = [NSString stringWithFormat:@"%@/zlqhPayModule/MakeIapOrder.php?starUserId=%@&userId=%@&createTime=%@&expireTime=%@&productId=%@&orderNo=%@",self.payStarInfo.serverIp,self.payStarInfo.eStarUserId,self.payStarInfo.userId,self.proStartTime,self.orderExpireTime,self.payStarInfo.iapPriceId,orderNo];
    NSLog(@"url:%@",urlStr);
    // 1.获得请求管理者
    AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];
    // 2.申明返回的结果是text/html类型，调用自定义的Policy
    //https://111.205.107.195:9633
    if ([self.payStarInfo.serverIp rangeOfString:@"195:9633"].location == NSNotFound) {
        [manager setSecurityPolicy:[AFSecurityPolicy customFormalSecurityPolicy]];
    } else {
        [manager setSecurityPolicy:[AFSecurityPolicy customTestSecurityPolicy]];
    }
    manager.responseSerializer = [AFHTTPResponseSerializer serializer];
    [manager GET:urlStr parameters:nil success:^(AFHTTPRequestOperation *operation, id responseObject) {
        if (responseObject != nil)
        {
            [self.act stopAnimating];
            NSError *error;
            NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:responseObject options:NSJSONReadingAllowFragments error:&error];
            if ([dic[@"return_code"] isEqualToString:@"SUCCESS"]) {
                [self doPayAction];
            } else {
                UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"支付提示" message:[NSString stringWithFormat:@"下单失败，请重试 错误信息：%@",dic[@"return_msg"]] preferredStyle:UIAlertControllerStyleAlert];
                UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleCancel handler:nil];
                [alert addAction:cancel];
                [self presentViewController:alert animated:YES completion:nil];
            }
        }
        
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        NSLog(@"Error: %@", error);
    }];
    
}

#pragma 发起支付请求
- (void)doPayAction {
    NSArray *product = [[NSArray alloc] initWithObjects:self.payStarInfo.iapPriceId,nil];
    NSSet * set = [NSSet setWithArray:product];
    SKProductsRequest * request = [[SKProductsRequest alloc] initWithProductIdentifiers:set];
    request.delegate = self;
    [request start];
}

// 以上查询的回调函数
- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
    NSArray *myProduct = response.products;
    if (myProduct.count == 0) {
        NSLog(@"无法获取产品信息，购买失败。");
        return;
    }
    SKPayment *payment = [SKPayment paymentWithProduct:myProduct[0]];
    NSLog(@"prorprorporpro%@",myProduct[0]);
    [[SKPaymentQueue defaultQueue] addPayment:payment];
}

- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {
    for (SKPaymentTransaction *transaction in transactions)
    {
        switch (transaction.transactionState)
        {
            case SKPaymentTransactionStatePurchased://交易完成
                [self completeTransaction:transaction];
                break;
            case SKPaymentTransactionStateFailed://交易失败
                [self failedTransaction:transaction];
                break;
            case SKPaymentTransactionStateRestored://已经购买过该商品
                [self restoreTransaction:transaction];
                break;
            case SKPaymentTransactionStatePurchasing://商品添加进列表
                NSLog(@"商品添加进列表");
                break;
            default:
                break;
        }
    }
    
}

- (void)completeTransaction:(SKPaymentTransaction *)transaction {
    
    [self postToServerReceiptWithTransaction:transaction];
    
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
    
}
#pragma 上传收据等信息
- (void)postToServerReceiptWithTransaction: (SKPaymentTransaction *)transaction  {
    NSLog(@"___________YYYYYYYY");
    [self.act startAnimating];
    NSString *urlStr = [NSString stringWithFormat:@"%@/zlqhPayModule/CheckIapReceipt.php?userId=%@&orderNo=%@&transactionId=%@",self.payStarInfo.serverIp,self.payStarInfo.userId,self.orderNo,transaction.transactionIdentifier];
    NSData *receipt = [NSData dataWithContentsOfURL:[[NSBundle mainBundle] appStoreReceiptURL]];
    NSDictionary *param = @{@"receipt": [receipt base64EncodedStringWithOptions:0]};
    
    // 1.获得请求管理者
    AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];
    // 2.申明返回的结果是text/html类型，调用自定义的Policy
    //https://111.205.107.195:9633
    if ([self.payStarInfo.serverIp rangeOfString:@"195:9633"].location == NSNotFound) {
        [manager setSecurityPolicy:[AFSecurityPolicy customFormalSecurityPolicy]];
    } else {
        [manager setSecurityPolicy:[AFSecurityPolicy customTestSecurityPolicy]];
    }
    [manager setSecurityPolicy:[AFSecurityPolicy customTestSecurityPolicy]];
    manager.responseSerializer = [AFHTTPResponseSerializer serializer];

    [manager POST:urlStr parameters:param constructingBodyWithBlock:nil success:^(AFHTTPRequestOperation * _Nonnull operation, id  _Nonnull responseObject) {
        if (responseObject != nil)
        {
            [self.act stopAnimating];
            NSError *error;
            NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:responseObject options:NSJSONReadingAllowFragments error:&error];
            if ([dic[@"return_code"] isEqualToString:@"SUCCESS"]) {
                UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"支付提示" message:[NSString stringWithFormat:@"您的订单已验证通过，点击“OK”后即可查看资讯信息:%@",dic[@"return_msg"]] preferredStyle:UIAlertControllerStyleAlert];
                UIAlertAction *OK = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
                    [self dismissViewControllerAnimated:YES completion:nil];
                }];
                [alert addAction:OK];
                [self presentViewController:alert animated:YES completion:nil];
            } else {
                UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"支付提示" message:[NSString stringWithFormat:@"订单验证失败，错误信息：%@",dic[@"return_msg"]] preferredStyle:UIAlertControllerStyleAlert];
                UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleCancel handler:nil];
                [alert addAction:cancel];
                [self presentViewController:alert animated:YES completion:nil];
            }
        }
    } failure:^(AFHTTPRequestOperation * _Nullable operation, NSError * _Nonnull error) {
        NSLog(@"Error: %@", error);
    }];
    
}

- (void)failedTransaction:(SKPaymentTransaction *)transaction {
    if(transaction.error.code != SKErrorPaymentCancelled) {
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"支付提示" message:[NSString stringWithFormat:@"购买失败，请重新购买"] preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleCancel handler:nil];
        [alert addAction:cancel];
        [self presentViewController:alert animated:YES completion:nil];
    } else {
        NSLog(@"用户取消交易");
    }
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void)restoreTransaction:(SKPaymentTransaction *)transaction {
    NSLog(@"该商品已购买过");
    [self postToServerReceiptWithTransaction:transaction];
    
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}


@end
