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
 *  @brief OpenApplus通知回调Block.
 */
typedef void (^OpenApplusCallback)(OACallbackType type, id data, OpenApplusNotify notify , NSError *error);
/**
 *  @brief APP STOP完成后的回调Block.
 */
typedef void (^OpenApplusAppStopBlock)(NSString *jskey);



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
