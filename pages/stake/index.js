// pages/stake-1/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
var that;
var repeatData = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pixelLeft:0,
    pixelTop:0,
    pixelWidth: 128,
    pixelHeight: 128,
    arrMask: [],
    tickID: 0,
    stage: 0,
    inCD: false,
    skillPositionArr: [],
    nowIndexArr: [], //当前使用的技能下标
    skillLink: [], //每个技能inCD等数据
    skillInfo: [], //技能详细数据
    repeatData: [], //技能定时器去重数据
    isShake: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this

    let temp
    let tempLink
    let skillPositionArr = []
    let skillLink = []
    for (var i = 0; i < 10; i++){
      temp = [
        // {display:"none",width:0,height:64,borderLeftWidth:64,borderBottomWidth:0},
        // {display:"none",width:64,height:0,borderTopWidth:64,borderLeftWidth:0},
        // {display:"none",width:0,height:64,borderRightWidth:64,borderTopWidth:0},
        // {display:"none",width:64,height:0,borderBottomWidth:64,borderRightWidth:0},
        {display:"none"},
        {display:"none"},
        {display:"none"},
        {display:"none"},
      ]
      tempLink = {inCD:false,tickID:0,stage:0}
      skillLink.push(tempLink)
      skillPositionArr.push(temp);
    }
    this.setData({
      skillPositionArr: skillPositionArr,
      skillLink: skillLink,

    })

    let promiseArr = [];
//将图片地址的上传的promise对象加入到promiseArr
    let promise = new Promise((resolve, reject) => {
      //这里可以写要发的请求，这里以上传为例
      setInterval(function(){
        that.onDraw(0)
      }, 16)
      setInterval(function(){
        that.onDraw(1)
      }, 16)
      setInterval(function(){
        that.onDraw(2)
      }, 16)
      setInterval(function(){
        that.onDraw(3)
      }, 16)
      setInterval(function(){
        that.onDraw(4)
      }, 16)
      setInterval(function(){
        that.onDraw(5)
      }, 16)
      setInterval(function(){
        that.onDraw(6)
      }, 16)
      setInterval(function(){
        that.onDraw(7)
      }, 16)
      setInterval(function(){
        that.onDraw(8)
      }, 16)
      setInterval(function(){
        that.onDraw(9)
      }, 16)
    });
    promiseArr.push(promise)
    // let promiseAnswer = new Promise((resolve, reject) => {
    //   //这里可以写要发的请求，这里以上传为例
    //   this.getAnswerList();
    // });
    // promiseArr.push(promiseAnswer)
//Promise.all处理promiseArr数组中的每一个promise对象
    Promise.all(promiseArr).then((result) => {
      //在存储对象的数组里的所有请求都完成时，会执行这里
      console.log(111)
    })
  },
  onDraw(index) {
    if (index === undefined || !that.data.skillLink[index].inCD){
      return;
    }
    var i = ++that.data.skillLink[index].tickID;

    let arrMask = that.data.skillPositionArr;
    let skillLink = that.data.skillLink;
    skillLink[index].tickID = i;

    // console.log(that.data.skillLink[index].stage)
    // var repeat = index.toString() + that.data.skillLink[index].stage.toString()
    // repeat = parseInt(repeat)

    // var repeatName = 'repeatData['+repeat+']'
    // that.setData({
    //   [repeatName]: 1
    // })
    switch(that.data.skillLink[index].stage) {
      case 0:
        arrMask[index][0].borderLeftWidth = i;
        break;
      case 1:
        arrMask[index][0].height = i + 2;
        arrMask[index][0].borderBottomWidth = 64 - i;
        break;
      case 2:
        arrMask[index][1].borderTopWidth = i;
        break;
      case 3:
        arrMask[index][1].width = i;
        arrMask[index][1].borderLeftWidth = (64-i);
        break;
      case 4:
        arrMask[index][2].width = 64 - i;
        arrMask[index][2].borderRightWidth = i;
        break;
      case 5:
        arrMask[index][2].height = i;
        arrMask[index][2].borderTopWidth = (64-i);
        break;
      case 6:
        arrMask[index][3].height = 64 - i;
        arrMask[index][3].borderBottomWidth = i;
        break;
      case 7:
        arrMask[index][3].width = i;
        arrMask[index][3].borderRightWidth = (64-i);
        break;
      case 8:
        skillLink[index].inCD = false;
        for(i=0; i<4; i++)
          arrMask[index][i].display = "none";
        break;
    }

    if (skillLink[index].tickID === 64) {
      skillLink[index].tickID = 0;
      skillLink[index].stage = skillLink[index].stage + 1;
    }
    var positionName = 'skillPositionArr['+index+']'
    var linkName = 'skillLink['+index+']'
    that.setData({
      [positionName]: arrMask[index],
      [linkName]: skillLink[index]
    })

  },
  handleMouseDown(event){
    var index = event.currentTarget.dataset.index

    if(that.data.skillLink[index].inCD){
      return;
    }
    let skillLink = that.data.skillLink
    skillLink[index].tickID = 0;
    skillLink[index].stage = 0;
    var indexArr = that.data.nowIndexArr
    indexArr.push(index)
    this.setData({
      pixelLeft: 0,
      pixelTop: 0,
      pixelWidth: 128,
      pixelHeight: 128,
      skillLink: skillLink,
      nowIndexArr: indexArr
    })
    this.onReset(index)
  },
  onReset(index){
    var newArr = this.data.skillPositionArr
    newArr[index].forEach(function(v, k){
      newArr[index][k].display = 'block'
    })
    newArr[index][0].width = 0;
    newArr[index][0].height = 0;
    newArr[index][0].borderLeftWidth = 0;
    newArr[index][0].borderBottomWidth = 64;

    newArr[index][1].width = 0;
    newArr[index][1].height = 0;
    newArr[index][1].borderTopWidth = 0;
    newArr[index][1].borderLeftWidth = 64;


    newArr[index][2].width = 64;
    newArr[index][2].height = 0;
    newArr[index][2].borderRightWidth = 0;
    newArr[index][2].borderTopWidth = 64;

    newArr[index][3].width = 0;
    newArr[index][3].height = 64;
    newArr[index][3].borderBottomWidth = 0;
    newArr[index][3].borderRightWidth = 64;

    let skillLink = that.data.skillLink
    skillLink[index].inCD = true;

    var positionName = 'skillPositionArr['+index+']'
    var linkName = 'skillLink['+index+']'
    that.setData({
      [positionName]: newArr[index],
      [linkName]: skillLink[index],
      isShake: true
    })
    setTimeout(function(){
      that.setData({
        isShake: false
      })
    },1000)
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
