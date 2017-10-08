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


//
//
////! Project version number for OpenApplus.
//FOUNDATION_EXPORT double OpenApplusVersionNumber;
//
////! Project version string for OpenApplus.
//FOUNDATION_EXPORT const unsigned char OpenApplusVersionString[];
//
//// In this header, you should import all the public headers of your framework using statements like #import <OpenApplus/PublicHeader.h>


@interface OpenApplus : NSObject

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


@end
