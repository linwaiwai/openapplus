//
//  OAConfiguration.h
//  wadmin
//
//  Created by linwaiwai on 4/7/17.
//  Copyright © 2017 linwaiwai. All rights reserved.
//

#import <Foundation/Foundation.h>


typedef NS_ENUM(NSInteger, OACallbackType){
    OACallbackTypeUnknow        = 0,
    OACallbackTypeAuthUser = 1,
//    OACallbackTypeJSConfig = 2,
};

typedef void (^OpenApplusNotify)(id data , NSError *error);

/**
 *  @brief 检验验证码完成后的回调Block.
 *
 *  @param response         获取验证码后成功返回的数据.
 *  @param error            错误信息.
 */
typedef void (^OpenApplusCallback)(OACallbackType type, id data, OpenApplusNotify notify , NSError *error);



@interface OAConfiguration : NSObject

@property(nonatomic, strong)NSString *appkey;
@property(nonatomic, strong)NSString *secret;

@property(nonatomic, strong)NSString *uid;
@property(nonatomic, copy)OpenApplusCallback callback;


+ (OAConfiguration *)sharedInstance;
+ (void)setUserIdentify: (NSString *)uid;
+ (void)setAppKey: (NSString *)appkey;
+ (void)setSecret: (NSString *)secret; 

@end
