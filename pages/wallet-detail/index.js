// pages/setting/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    showPopup: false,
    money:0
  },
  onLoad() { },

  onShow() {
    this.getMoney();
  },
  /**
   * 权限页面
   */
  authorize() {
    wx.openSetting({})
  },

  getMoney() {
    const url = api.userAPI + 'wallet/get-money?type=' + 1
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          money: res.data.data['money']
        })
      }
    })
  },

  /**
   * 去充值页面
   */
  gotoRecharge(event){
    if(!app.checkUserDetailGoAuth()){
      return;
    }

    wx.navigateTo({
      url: "/pages/recharge/index?money="+ this.data.money
    })
  },

  /**
   * 去日志页面
   */
  gotoLog(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }

    wx.navigateTo({
      url: "/pages/recharge-log/index"
    })
  },

  /**
   * 清除缓存
   */
  clearStorage() {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要清除所有缓存？",
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage()
        }
      }
    })
  },

  /**
   * 展开或收起弹出层
   */
  togglePopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    const src = event.currentTarget.dataset.src
    const urls = [src]

    wx.previewImage({
      current: "",
      urls: urls
    })
  },

  /**
   * 复制仓库地址
   */
  copyLink() {
    wx.setClipboardData({
      data: app.globalData.githubURL,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wxutil.showToast("GitHub地址已复制")
          }
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})
