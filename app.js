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
    if (this.globalData.userDetail) {
      header["Authorization"] = "Token " + this.globalData.userDetail.token
    }
    return header
  },

  /**
   * Token无效跳转授权页
   */
  gotoAuthPage(res) {
    if (res.data.code == 50002) {
      wx.navigateTo({
        url: "/pages/auth/index",
      })
    }
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
