// pages/answer-add/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version_list:[],
    version: 0,
    formData:{},
    hasCoin:false,
    imageUrl:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(wxutil.getStorage('version_list')){
      this.setData({
        version_list: wxutil.getStorage('version_list')
      })
    }
  },

  buttonClick(e) {
    let type = e.target.dataset.type;
    type = 'formData.'+ type;
    let value = e.target.dataset.value;
    this.setData({
      [type]: value
    })
    console.log(this.data.formData);
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
