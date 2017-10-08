## Openapplus 安装

使用CocosPods集成Openapp+到Xcode，需要编写/podspec/OpenApplus.podspec文件

```ObjectiveC
Pod::Spec.new do |s|
    s.name         = "OpenApplus"
    s.version      = "1.0.0"
    s.summary      = "OpenApplus framework"
    s.homepage     = "http://github.com/linwaiwai/openapplus"
    s.license      = { :type => 'OpenApplus License, Version 1.0.0', :text => <<-LICENSE
      Licensed under the OpenApplus License, Version 1.0.0 (the "License");
      you may not use this file except in compliance with the License.
      LICENSE
    }
    s.author   = "linwaiwai"
    s.platform     = :ios, "6.0.0"
    s.source       = { :git => "https://github.com/linwaiwai/openapplus.git", :branch => "master"}
    s.frameworks = "UIKit"
    s.requires_arc = true
    s.dependency 'SDWebImage', '3.7.5'
    s.dependency 'SSZipArchive', '1.6.2'
    s.dependency 'SVProgressHUD', '2.1.2'
    s.dependency 'Masonry', '1.0.2'
    s.dependency 'UMengUShare/Social/WeChat', '6.3.0'
    s.dependency 'MJRefresh', '3.1.12'
    s.dependency 'libextobjc', '~> 0.4.1'
    s.dependency 'ASIHTTPRequest'
    s.dependency 'AFNetworking'
    s.dependency 'OpenUDID'

    s.subspec 'OpenApplus' do |ss|
        ss.vendored_frameworks = '*.framework'
        ss.vendored_libraries = '*.a'
        ss.source_files = '*.h'
        ss.resource = '*.bundle'
    end
end
```

### 在Podfile文件加入
```ObjectiveC
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '8.0'
#忽略引入库的警告
inhibit_all_warnings!

target 'openapplus-ios-demo' do
    pod 'OpenApplus', :podspec => './podspec/OpenApplus.podspec'
end
```
### OpenApplus.podspec 内容
```ObjectiveC
Pod::Spec.new do |s|
    s.name         = "OpenApplus"
    s.version      = "1.0.0"
    s.summary      = "OpenApplus framework"
    s.homepage     = "http://github.com/linwaiwai/openapplus"
    s.license      = { :type => 'OpenApplus License, Version 1.0.0', :text => <<-LICENSE
      Licensed under the OpenApplus License, Version 1.0.0 (the "License");
      you may not use this file except in compliance with the License.
      LICENSE
    }
    s.author   = "linwaiwai"
    s.platform     = :ios, "6.0.0"
    s.source       = { :git => "https://github.com/linwaiwai/openapplus.git", :branch => "master"}
    s.frameworks = "UIKit"
    s.requires_arc = true
    s.dependency 'SDWebImage', '3.7.5'
    s.dependency 'SSZipArchive', '1.6.2'
    s.dependency 'SVProgressHUD', '2.1.2'
    s.dependency 'Masonry', '1.0.2'
    s.dependency 'UMengUShare/Social/WeChat', '6.3.0'
    s.dependency 'MJRefresh', '3.1.12'
    s.dependency 'libextobjc', '~> 0.4.1'
    s.dependency 'ASIHTTPRequest'
    s.dependency 'AFNetworking'
    s.dependency 'OpenUDID'

    s.subspec 'OpenApplus' do |ss|
        ss.vendored_frameworks = '*.framework'
        ss.vendored_libraries = '*.a'
        ss.source_files = '*.h'
        ss.resource = '*.bundle'
    end
end
```
