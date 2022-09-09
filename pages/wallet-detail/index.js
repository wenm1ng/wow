// pages/setting/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    showPopup: false,
    money:0,
    isIos: false,
    isShowIos: false
  },
  onLoad() { },

  onShow() {
    this.checkSystem()
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

  checkSystem(){
    let isIos = false
    try {
      const res = wx.getSystemInfoSync()
      if(res.platform === 'ios'){
        isIos = true;
      }
    } catch (e) {
      // Do something when catch error
      isIos = false;
    }
    this.setData({
      isIos: isIos
    })
  },

  /**
   * 去充值页面
   */
  gotoRecharge(event){
    if(!app.checkUserDetailGoAuth()){
      return;
    }

    if(this.data.isIos){
      //如果是ios系统，提示不支持
      this.setData({
        isShowIos: true
      })
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

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
