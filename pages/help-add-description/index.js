// pages/help-add-description/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    description: '',
    from: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      description: options.description ? options.description : '',
      from: options.from ? options.from : '',
    })
  },
  formSubmit(e){
    var length = parseInt(e.detail.value.description.length)
    const str = this.data.from === 'answer' ? '采纳' : '回答';
    const description = e.detail.value.description;
    if(length < 15){
      wx.showModal({
        title: "提示",
        content: "强烈建议您写15字以上，会更容易被" + str + '!',
        success: (res) => {
          if (res.confirm) {
            this.gobackDescription(description);
          }
        },
        fail: (res) => {
        },
      })
    }else{
      this.gobackDescription(description);
    }
  },
  gobackDescription(description){
    var pages = getCurrentPages();   //当前页面

    var prevPage = pages[pages.length - 2];   //上一页面

    prevPage.setData({
      //直接给上一个页面赋值
      ['formData.description']: description,
    });
    // console.log(prevPage.data.formData)
    wx.navigateBack({
      //返回
      delta: 1
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
