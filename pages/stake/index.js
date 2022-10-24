// pages/stake-1/index.js
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pixelLeft:0,
    pixelTop:0,
    pixelWidth: 64,
    pixelHeight: 64,
    arrMask: [],
    tickID: 0,
    stage: 0,
    inCD: false,
    skillPositionArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this
    let temp
    let skillPositionArr = []
    for (var i = 0; i < 1; i++){
      temp = [
        {display:"none",width:0,height:32,borderLeftWidth:32,borderBottomWidth:0},
        {display:"none",width:32,height:0,borderTopWidth:32,borderLeftWidth:0},
        {display:"none",width:0,height:32,borderRightWidth:32,borderTopWidth:0},
        {display:"none",width:32,height:0,borderBottomWidth:32,borderRightWidth:0},
      ]
      skillPositionArr.push(temp);
    }
    this.setData({
      skillPositionArr: skillPositionArr
    })
    setInterval(this.onDraw, 16)
  },
  onDraw() {
    if (!that.data.inCD){
      return;
    }

    var i = ++that.data.tickID;
    that.setData({
      tickID: i
    })
    let arrMask = that.data.skillPositionArr;

    switch(that.data.stage) {
      case 0:
        arrMask[0][0].borderLeftWidth = i;
        break;
      case 1:
        arrMask[0][0].height = i;
        arrMask[0][0].borderBottomWidth = 32 - i;
        // arrMask[0][0].borderLeftWidth = i + 50;
        break;
      case 2:
        arrMask[0][1].borderTopWidth = i;
        break;
      case 3:
        arrMask[0][1].width = i;
        arrMask[0][1].borderLeftWidth = (32-i);
        break;
      case 4:
        arrMask[0][2].width = 32 - i;
        arrMask[0][2].borderRightWidth = i;
        break;
      case 5:
        arrMask[0][2].height = i;
        arrMask[0][2].borderTopWidth = (32-i);
        break;
      case 6:
        arrMask[0][3].height = 32 - i;
        arrMask[0][3].borderBottomWidth = i;
        break;
      case 7:
        arrMask[0][3].width = i;
        arrMask[0][3].borderRightWidth = (32-i);
        break;
      case 8:
        that.setData({
          inCD: false
        })
        for(i=0; i<4; i++)
          arrMask[0][i].display = "none";
        break;
    }
    that.setData({
      skillPositionArr: arrMask
    })
    if (that.data.tickID === 32) {
      that.setData({
        tickID: 0,
        stage: that.data.stage + 1
      })
    }
  },
  handleMouseDown(){

    // this.setData({
    //   pixelLeft: 2,
    //   pixelTop: 2,
    //   pixelWidth: 60,
    //   pixelHeight: 60
    // })
    if(that.data.inCD){
      return;
    }
    this.setData({
      pixelLeft: 0,
      pixelTop: 0,
      pixelWidth: 64,
      pixelHeight: 64,
      tickID: 0,
      stage: 0,
    })
    this.onReset()
  },
  onReset(){
    var arr = this.data.skillPositionArr
    var newArr = arr;
    arr.forEach(function(val, key){
      val.forEach(function(v, k){
        newArr[key][k].display = 'block'
      })
      newArr[key][0].width = 0;
      newArr[key][0].height = 0;
      newArr[key][0].borderLeftWidth = 0;
      newArr[key][0].borderBottomWidth = 32;

      newArr[key][1].width = 0;
      newArr[key][1].height = 0;
      newArr[key][1].borderTopWidth = 0;
      newArr[key][1].borderLeftWidth = 32;


      newArr[key][2].width = 32;
      newArr[key][2].height = 0;
      newArr[key][2].borderRightWidth = 0;
      newArr[key][2].borderTopWidth = 32;

      newArr[key][3].width = 0;
      newArr[key][3].height = 32;
      newArr[key][3].borderBottomWidth = 0;
      newArr[key][3].borderRightWidth = 32;
    })
    this.setData({
      inCD:true,
      skillPositionArr: newArr
    })
    // setTimeout(function(){
    //   that.setData({
    //     inCD: true
    //   })
    // },1000)
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
