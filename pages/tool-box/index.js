// pages/tool-box/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({

  /**
   * 页面的初始数据
   */
  data: {
    toolList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getToolList();
  },

  getToolList(){
    const url = api.commonAPI + 'tool/list'
    const that = this
    wxutil.request.get(url).then((res) => {
      if(res.data.code === 200){
        that.setData({
          toolList: res.data.data
        })
      }
    })
  },
  gotoPage(e){
    wx.navigateTo({
      url: this.data.toolList[e.detail.index].page_path + '?id=' + this.data.toolList[e.detail.index].id
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
