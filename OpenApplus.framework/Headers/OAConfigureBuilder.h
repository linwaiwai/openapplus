//
//  OAConfigureBuilder.h
//  OpenApplus
//
//  Created by linwaiwai on 2020/4/27.
//  Copyright © 2020 openapplus. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface OAConfigureBuilder : NSObject

@property(nonatomic, strong, readonly) UIColor *statusBarColor;
@property(nonatomic, assign, readonly) BOOL moreButtonEnabled  ;


- (OAConfigureBuilder*)setStatusBarColor:(UIColor*)color;
- (OAConfigureBuilder*)enableMoreButton:(BOOL)enable;

- (void) apply;
@end

NS_ASSUME_NONNULL_END
