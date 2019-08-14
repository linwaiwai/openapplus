//
//  OARequestWrapper.h
//  OpenApplus
//
//  Created by linwaiwai on 4/28/17.
//  Copyright © 2017 OpenApplus. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "OAConfiguration.h"
#import "OAAuthDtoWrapper.h"
@interface OAUserAuthRequestWrapper : NSObject

@property(nonatomic, strong)id request;

-(void)sendObject:(OAAuthDtoWrapper*)dtoWrapper notify:(OpenApplusNotify)notify;

@end
