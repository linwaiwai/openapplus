//
//  OATinyProgramViewController.h
//  OpenApplus
//
//  Created by linwaiwai on 22/09/2017.
//  Copyright © 2017 OpenApplus. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "OATinyProgramInternalViewController.h"


@interface OATinyProgramController : OATinyProgramInternalViewController

-(void)navigateToMiniProgram:(NSString*)name;

-(void)navigateBack;

@end
