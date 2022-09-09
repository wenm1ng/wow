// pages/setting/index.js
const app = getApp()
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

  getMoney(){

  },
  gotoWalletDetail(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    wx.navigateTo({
      url: "/pages/wallet-detail/index"
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

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
