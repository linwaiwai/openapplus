window = (function(){
  var __callback = {};
  var callbackId = 1;
  var that = this;
  // window.ideMockBridge = {}; // bridge 及bridge.call问题
// todo: delete
/*window.ideMockCallBridge = (_, { args: [name, params] }) => {
 _ideTemplate(name, params, params.success, params.fail);
 };*/
  return {
        ideMockBridge:{
            call :function (method, options, callback) {
                console.log(method);
            }
        },
        ideMockAP: {
            chooseImage:function(params){
                this.invoke('chooseImage', params);
            },
            navigateToMiniProgram:function(params){
                this.invoke('navigateToMiniProgram', params);
            },
            navigateBackMiniProgram:function(params){
                this.invoke('navigateBackMiniProgram', params);
            },
            setClipboardData:function(params){
                this.invoke('setClipboardData', params);
            },
            getClipboardData:function(params){
                this.invoke('getClipboardData', params);
            },
            onAppPerfEvent: function(params){
                this.invoke('getNetworkType', params);
            },
            onCompassChange:function(fn){
                var params = {
                    success:fn,
                    fail:function(){

                    }
                }
                this.invoke('onCompassChange', params);
            },
            makePhoneCall: function(params){
                this.invoke('makePhoneCall', params);
            },
            stopCompass: function(params){
                this.invoke('stopCompass', params);
            },
            onNetworkStatusChange:function(fn){
                var params = {
                    success:fn,
                    fail:function(){

                    }
                }
                this.invoke('onNetworkStatusChange', params);
            },
            onUserCaptureScreen:function(fn){
                var params = {
                    success:fn,
                    fail:function(){

                    }
                }
                this.invoke('onUserCaptureScreen', params);
            },
            getNetworkType:function(params){
                this.invoke('getNetworkType', params);
            },
            addPhoneContact:function(params){
                this.invoke('addPhoneContact', params);
            },
            getScreenBrightness:function(params){
                this.invoke('getScreenBrightness', params);
            },
            vibrateShort:function(params){
                this.invoke('vibrateShort', params);
            },
            vibrateLong:function(params){
                this.invoke('vibrateLong', params);
            },
            scanCode:function(params){
                this.invoke('scanCode', params);
            },
            showModal:function(params){
                this.invoke('showModal', params);
            },
            hideModal:function(params){
                this.invoke('hideModal', params);
            },
            showToast:function(params){
                this.invoke('showToast', params);
            },
            hideToast:function(params){
                this.invoke('hideToast', params);
            },
            showNavigationBarLoading: function(params){
                this.invoke('showNavigationBarLoading', params)
            },
            hideNavigationBarLoading: function(params){
                this.invoke('hideNavigationBarLoading', params)
            },
            getSystemInfoSync :function(){
                return this.callInternalAPISync("getSystemInfoSync");
            },
            getSystemInfo :function(params){
                return this.invoke("getSystemInfo", params);
            },
            getStorageSync :function(key){
                return this.callInternalAPISync("getStorageSync",{key:key});
            },
            setStorageSync :function(key, data){
                this.callInternalAPISync("getStorageSync",{
                    key:key,
                    data:data
                });
            },
            clearStorageSync :function(key, data){
                this.callInternalAPISync("clearStorageSync",{
                });
            },
            getUserInfo :function(params){
                this.invoke('getUserInfo', params)
            },
            login :function(params){
                this.invoke('login', params)
            },
            request:function(params){
                this.invoke('request', params)
            },
            showLoading:function(params){
                this.invoke('showLoading', params)
            },
            hideLoading:function(params){
               this.invoke('hideLoading', params)
            },
            callBridgeSync: function(event, data){
                console.debug("callInternalAPISync : "+ event + " withParam:" + JSON.stringify(data));
                return callAPISync(event, data);
            },
            simulated: false,
            on: function (event, fn) {
                self.OpenApplusJSBridge.on(event,fn);
            },
            invoke:function(event, params){
                var newParams = Object.assign({
                    success: function(res){
                        params && params.success && params.success(res);
                    }, 
                    fail:function (res){
                        params && params.fail && params.fail(res);
                    }
                }, params);
                this.call(event,newParams , function(res){
                    if (res && res.error){
                       newParams.fail && newParams.fail(res);
                   } else {
                       newParams.success && newParams.success(res);
                   }
               });
            },
            call: function (event, params, callback) {
                self.OpenApplusJSBridge.call(event,params, callback);
            }
        }
    };
})();
