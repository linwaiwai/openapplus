//
//  OAInternalConfiguration.h
//  OpenApplus
//
//  Created by linwaiwai on 4/28/17.
//  Copyright © 2017 OpenApplus. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "OAProject.h"
@class OAConfigureBuilder;
@interface OAInternalConfiguration : NSObject


@property(nonatomic, strong) UIColor *statusBarColor;
@property(nonatomic, assign) BOOL enableMoreButton  ;

@property(nonatomic, strong)NSString *serverAppKey;
@property(nonatomic, strong)NSString *serverAppSecret;
@property(nonatomic, assign)BOOL showDebugVConsole;
@property(nonatomic, weak)UINavigationController *navigationController;

+ (OAProject*)packageOfIntance:(id)instance;
+ (void)removeIntance:(id)instance;


+ (OAInternalConfiguration *)sharedInstance;
//+ (NSMutableDictionary *)getData;
+ (NSString *)infoPath ;
- (void)setBuilder:(OAConfigureBuilder*)builder;

@end
