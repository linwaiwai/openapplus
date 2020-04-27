//
//  OpenApplus.h
//  wadmin
//
//  Created by linwaiwai on 4/5/17.
//  Copyright © 2017 linwaiwai. All rights reserved.
//


#import <UIKit/UIKit.h>
#import "OAConfiguration.h"
#import "OAUserAuthRequestWrapper.h"
#import "OAConfigureBuilder.h"
@interface OpenApplus : NSObject
/**
 进入小容器容器
 */
+ (void)navigateToMiniProgram:(NSString *)name completion:(dispatch_block_t)completion;
/**
 设置navigationController
 */
+(void)setNavigationController:(UINavigationController *)navigationController;

+(void)setupCallback:(OpenApplusCallback)callback;
/**
 注册App

 @param name  小程序的JSKey
 @param secret  小程序的secret;
 */
+ (void)startWithAppKey:(NSString*) name andSecret:(NSString*)secret;

+ (void)setAppStopBlock:(OpenApplusAppStopBlock)stopBlock;
/**
获取启动的应用信息
*/
+ (NSArray *)getApps;

/**
 同步下载包信息
 */
+ (void)sync;

/**
 开启logger
 */
+ (void)enableLogging:(BOOL)enable;

/**
模拟服务器授权请求
*/
+ (OAUserAuthRequestWrapper*)requestWithAppKey:(NSString*)appKey andSecret:(NSString*)secret;

+(BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;
/**
SDK版本号
*/
+(NSString *)sdkVersion;

+(OAConfigureBuilder *)configure;

@end
