// pages/stake/index.js
var startPoint

Page({

 data: {
   //按钮位置参数
   list: [1,2,3,4,5,6,7,8],
   buttonTop: 0,
   buttonLeft: 0,
   windowHeight: '',
   windowWidth: '',
   time:10,
   isUse: false
 },
 onLoad:function(){

  var that =this;
  wx.getSystemInfo({
    success: function (res) {
      console.log(res);
      // 屏幕宽度、高度
      console.log('height=' + res.windowHeight);
      console.log('width=' + res.windowWidth);
      // 高度,宽度 单位为px
      that.setData({
        windowHeight:  res.windowHeight,
        windowWidth:  res.windowWidth,
        buttonTop:res.windowHeight*0.70,//这里定义按钮的初始位置
        buttonLeft:res.windowWidth*0.70,//这里定义按钮的初始位置
      })
    }
  })
},
useSkill(){
   this.setData({
     isUse: true
   })
  this.donghua()
},
donghua(){
   var that = this
  var outside = setInterval(function () {
    var CD = that.data.time
    if (1 == CD) {
      clearInterval(outside);
      that.setData({
        time: CD
      })
      let cdFloat = CD - 0.1;
      const timeFloat = setInterval(function () {
        that.setData({
          time: cdFloat.toFixed(1)
        })
        cdFloat -= 0.1;
        if (cdFloat <= 0) {
          console.log(111)
          clearInterval(timeFloat);
          CD = 10;
          that.setData({
            time: CD,
            isUse: false
          })
        }
      }, 90)
    } else {
       that.setData({
         time: that.data.time - 1
       })
    }
  }, 1000)
},
//以下是按钮拖动事件
buttonStart: function (e) {
  startPoint = e.touches[0]//获取拖动开始点
},
buttonMove: function (e) {
  var endPoint = e.touches[e.touches.length - 1]//获取拖动结束点
  //计算在X轴上拖动的距离和在Y轴上拖动的距离
  var translateX = endPoint.clientX - startPoint.clientX
  var translateY = endPoint.clientY - startPoint.clientY
  startPoint = endPoint//重置开始位置
  var buttonTop = this.data.buttonTop + translateY
  var buttonLeft = this.data.buttonLeft + translateX
  //判断是移动否超出屏幕
  if (buttonLeft+50 >= this.data.windowWidth){
    buttonLeft = this.data.windowWidth-50;
  }
  if (buttonLeft<=0){
    buttonLeft=0;
  }
  if (buttonTop<=0){
    buttonTop=0
  }
  if (buttonTop + 50 >= this.data.windowHeight){
    buttonTop = this.data.windowHeight-50;
  }
  this.setData({
    buttonTop: buttonTop,
    buttonLeft: buttonLeft
  })
},
buttonEnd: function (e) {
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
