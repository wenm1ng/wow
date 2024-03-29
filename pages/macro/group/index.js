// pages/macro/group/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    modalHeight: 600,
    contentHeight: 150,
    scrollHeight:450,
    macroStr: '',
    name: '',
    logId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.lin.initValidateForm(this)
  },

  //重置表单
  onReset(){
    wx.lin.resetForm('macro');
    wx.lin.resetForm('macroName');
    this.setData({
      logId: 0
    })
  },
  submit(e){
    const url = api.macroAPI + 'group'
    const data = e.detail.values
    const that = this
    wxutil.request.post(url, data).then((res) => {
      if(res.data.code === 200){
        that.setData({
          macroStr: res.data.data.content,
          modalShow: true,
          logId: res.data.data.id
        })
      }
    })
  },
  //保存到我的宏
  saveMacro(e){
    console.log(e.detail.values);

    if(e.detail.values.name === ''){
      wx.showToast({
        title: '宏名称不能为空',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return;
    }
    const that = this
    app.saveMacro(this.data.logId, e.detail.values.name, that.data.macroStr, function(){
      that.closeMyModal()
    })
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false,
      macroStr: '',
      logId: 0
    })
  },
  updateMacro(e){
    this.setData({
      macroStr: e.detail.value
    })
  },
  closeMyModal(){
    wx.lin.resetForm('macroName');
    this.setData({
      modalMyShow: false,
    })
  },
  showMyModal(){
    this.setData({
      modalMyShow: true,
    })
  },
  //复制宏
  copyStr(){
    wx.setClipboardData({
      data:this.data.macroStr,//要复制的数据
      success (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000//持续的时间
        })
      }
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
