Pod::Spec.new do |s|
    s.name         = "OpenApplus"
    s.version      = "1.3.8"
    s.summary      = "OpenApplus framework"
    s.homepage     = "https://github.com/linwaiwai/openapplus"
    s.license      = { :type => 'OpenApplus License, Version 1.3.8', :text => <<-LICENSE
      Licensed under the OpenApplus License, Version 1.3.8 (the "License");
      you may not use this file except in compliance with the License.
      LICENSE
    }
    s.author   = "linwaiwai"
    s.platform     = :ios, "8.0.0"
    s.source       = { :git => "https://github.com/linwaiwai/openapplus.git", :tag => s.version}
    s.frameworks = "UIKit",'Foundation'
    s.requires_arc = true
    
    s.dependency "SSZipArchive", "1.6.2"
    s.dependency "SVProgressHUD"
    s.dependency "UMengUShare/Social/WeChat", "6.3.0"
    s.dependency "MJRefresh", "3.1.12"
    s.dependency "AFNetworking"
    s.dependency "SDWebImage", "3.7.5"

    s.subspec "OpenApplus" do |ss|
        ss.vendored_frameworks = "*.framework"
    end
end