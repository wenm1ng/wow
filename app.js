//app.js
const api = require("./config/api")
const wxutil = require("./utils/wxutil")
const { image } = require("./utils/wxutil")

App({
  api: api,
  wxutil: wxutil,

  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId,
    githubURL: "https://github.com/YYJeffrey/july_client",
    userDetail: null
  },

  onLaunch() {
    this.getUserDetail()
    wxutil.autoUpdate()
    this.showMessageNum()
  },

  /**
   * 获取用户详情
   */
  getUserDetail() {
    const userDetail = wxutil.getStorage("userDetail")
    if (userDetail) {
      this.globalData.userDetail = userDetail
    } else {
      this.globalData.userDetail = null
    }
  },
  getUserDetailNew() {
    const userDetail = wxutil.getStorage("userDetail")
    if (userDetail) {
      return userDetail
    }
    return null;
  },
  /**
   * 获取回答modelId
   * @returns {string}
   */
  setModelId(){
    const url = api.userAPI + 'get-model-id';
    const data = {
      'type': 1
    }
    wxutil.request.get(url, data).then((rs) => {
      if (rs.data.code === 200) {
        wxutil.setStorage("answerModelId", rs.data.data, 172800)
      }
    })
  },
  getModelId(type){
    let modelId = '';
    if(type === 1){
      modelId = wxutil.getStorage('answerModelId');
    }
    return modelId;
  },
  wxPushMessage(){
    wx.getSetting({
      withSubscriptions: true,
      success: function (res) {
        console.log(res);
        if (res.subscriptionsSetting.mainSwitch) {
          console.log(res.subscriptionsSetting.itemSettings);
          if (res.subscriptionsSetting.itemSettings && res.subscriptionsSetting.itemSettings !== 'undefined') { // 用户同意总是保持是否推送消息的选择, 这里表示以后不会再拉起推送消息的授权
            let moIdState = res.subscriptionsSetting.itemSettings;
            // 用户同意的消息模板id
            if (moIdState === 'accept') {
              self.requestSubscribeMessage()
            } else if (moIdState === 'reject') {

            } else if (moIdState === 'ban') {} else {}
          } else {
            wx.showModal({
              title: '提示',
              content: '是否允许接收消息提醒',
              success(res) {
                if (res.confirm) {
                  wx.setStorageSync("hasAcceptMessage", 1)
                  // subMessage.getGuestTemplateIds()
                  self.requestSubscribeMessage()
                }
              }
            })
          }
        }
      },
      fail: function (error) {
        console.log(error, "errror+++++++++++")
      }
    })
    //监听用户点击了允许还是拒绝
    // requestSubscribeMessage() {
    //   let result = wx.requestSubscribeMessage({
    //     tmplIds: '消息模板id'
    //   })
    //   if (result["MBdGe93b1r3hfb8i_WziD2cnAos-ZdHq0QKl_-bLg6s"] == 'accept') {
    //
    //     console.log("接受了不再询问")
    //   } else if (result["MBdGe93b1r3hfb8i_WziD2cnAos-ZdHq0QKl_-bLg6s"] == 'reject') {
    //     console.log("出错了reject")
    //   }
    // },

  },
  /**
   * 添加推送数量
   */
  addPushNum(num, resolve){
    const appHeader = this.getHeader()
    console.log(appHeader);
    num = num + 1
    let message = '当前推送数量:'+ num;
    const modelId = this.getModelId(1)
    if(!modelId){
      return;
    }
    // this.wxPushMessage();
    // return;
    wx.requestSubscribeMessage({
      tmplIds: [modelId],
      success: (res) => {
        if (res[modelId] === 'accept') {
          const url = api.userAPI + 'add-push-num';
          const data = {
            model_id: modelId,
            'type': 1
          }
          let head = {
            'content-type': 'application/json'
          }
          head = Object.assign(head, appHeader)
          wxutil.request.post(url, data, head).then((rs) => {
            if (rs.data.code === 200) {
              wx.showToast({
                title: message,
                icon: 'success',
                duration: 2000,
                success(data) {
                  //成功
                  resolve()
                }
              })
            } else {
              wx.showToast({
                title: '操作失败',
                icon: 'error',
                duration: 2000//持续的时间
              })
            }
          })
        }
      },
      fail(err) {
        console.log(err);
        //失败
      }
    })
  },
  /**
   * 缓存图片
   */
  cacheImage(imageUrl,imageIcon){
    var that = this;
    console.log(imageUrl);
    wx.downloadFile({
      url: imageUrl,
      success: function(res) {
        if (res.statusCode === 200) {
          const fs = wx.getFileSystemManager()
          //  fs为全局唯一的文件管理器。那么文件管理器的作用是什么，我们可以用来做什么呢？
          //   文件管理器的作用之一就是可以根据临时文件路径，通过saveFile把文件保存到本地缓存.
          console.log(res.tempFilePath);
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              console.log('图片缓存成功', res.savedFilePath) // res.savedFilePath 为一个本地缓存文件路径
              // 此时图片本地缓存已经完成，res.savedFilePath为本地存储的路径。
              //小程序的本地文件路径标准： {{协议名}}://文件路径
              //协议名在 iOS/Android 客户端为 "wxfile"，在开发者工具上为 "http"，
              //开发者无需关注这个差异，也不应在代码中去硬编码完整文件路径。
              //好了，到此为止，我们已经把图片缓存到本地了，而且我们也得到了本地缓存的路径。
              // 那么我们把本地缓存的路径，通过小程序的数据缓存服务保存下来。
              // 下次打开小程序 首先去缓存中检查是否存在本地文件的缓存路径
              // 如果有，直接image src赋值本地缓存路径。
              //如果没有，则是第一次下载图片，或者用户手动清理缓存造成的。
              wx.setStorageSync(imageIcon, res.savedFilePath)
              return that.getCacheImage(imageIcon);
            },
            fail(res){
              console.log(res);
            }
          })
        }else{
          console.log('响应失败');
        }
      },
      fail(res){
        console.log('图片失败',res);
      }
    })
  },

  /**
   * 获取缓存图片
   */
  getCacheImage(imageIcon){
    const path = wx.getStorageSync(imageIcon)
    if (path != null) {
      return path;
    }else {
      return null;
    }
  },
  /**
   * 获取请求头
   */
  getHeader() {
    let header = {}
    if (this.getUserDetailNew()) {
      header["Authorization"] = "Token " + this.getUserDetailNew().token
    }
    return header
  },

  //默认显示tarBar新消息数量
  showMessageNum(){
    if(this.globalData.userDetail){
      const url = api.userAPI + 'get-message';
      let head = {
        'content-type': 'application/json'
      }
      const appHeader = this.getHeader()
      const header = {}
      head = Object.assign(head, appHeader)
      wx.showNavigationBarLoading()
      let res = new Promise((resolve, reject) => {
        wx.request({
          url: url,
          data: {},
          header: Object.assign(head, header),
          method: 'POST',
          success(res) {
            resolve(res)
          },
          fail() {
            reject('request failed')
          },
          complete() {
            wx.hideNavigationBarLoading()
          }
        })
      })
      res.then((res) => {
        if (res.data.code === 200 && res.data.data > 0) {
          this.globalData.noRead = res.data.data
          if(res.data.data === ''){
            wx.removeTabBarBadge({
              index: 2,
            })
          }else{
            wx.setTabBarBadge({
              index: 2,
              text: res.data.data
            })
          }
        }
      })
    }
  },
  /**
   * Token无效跳转授权页
   */
  gotoAuthPage(res) {
    if (res.data.code === 50002) {
      wx.clearStorage()
      wx.navigateTo({
        url: "/pages/auth/index",
      })
    }
  },
  goAuthPage(){
    wx.navigateTo({
      url: "/pages/auth/index",
    })
  },
  /**
   * 删除数组某一下标
   * @param arr
   * @param obj
   * @returns {*}
   */
  arrRemoveObj(arr, obj){
    let len = arr.length;
    for (let i = 0; i < len; i++) {
      if (arr[i] === obj) {
        if (i === 0) {
          arr.shift();
          return arr;
        } else if (i === len - 1) {
          arr.pop();
          return arr;
        } else {
          arr.splice(i, 1);
          return arr;
        }
      }
    }
  }

})
