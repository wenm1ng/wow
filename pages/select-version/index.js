// pages/select-occupation/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version_list:[] //版本列表
  },

  //选好职业后下一个页面
  nextPage(e){
    let version = e.currentTarget.dataset.version;
    wx.navigateTo({
      url: "/pages/select-occupation/index?version=" + version
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVersionList()
  },

  getVersionList() {
    const that = this
    const url = api.versionAPI+'get-version-list'
    const data = {}
    if(app.globalData.version_list){
      this.setData({
        version_list: app.globalData.version_list
      })
    }else{
      wxutil.request.get(url, data).then((res) => {
        if (res.data.code == 200) {
          app.globalData.version_list = res.data.data
          this.setData({
            version_list: res.data.data
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})