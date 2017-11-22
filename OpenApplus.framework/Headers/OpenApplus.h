//
//  OpenApplus.h
//  wadmin
//
//  Created by linwaiwai on 4/5/17.
//  Copyright © 2017 linwaiwai. All rights reserved.
//


#import <Foundation/Foundation.h>
#import "OAConfiguration.h"
#import "OARequestWrapper.h"
#import "OATinyProgramController.h"
@interface OpenApplus : NSObject
/**
 进入小容器容器
 */
+(void)navigateToMiniProgram:(NSString *)url;
/**
 设置navigationController
 */
+(void)setNavigationController:(UINavigationController *)navigationController;


+(void)setupCallback:(OpenApplusCallback)callback;
/**
 注册App

 @param name name app名称
 */
+ (void)startWithAppKey:(NSString*) name andSecret:(NSString*)secret;

/**
 同步下载包信息
 */
+ (void)sync;

+ (OARequestWrapper*)requestWithAppKey:(NSString*)appKey andSecret:(NSString*)secret;

+(BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;


@end
