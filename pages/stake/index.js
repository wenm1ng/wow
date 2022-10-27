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
    skillList: [], //技能详细数据
    finalSkillList: [], //技能筛选后的数据
    repeatData: [], //技能定时器去重数据
    isShake: false,
    energy: 100, //能量条
    imgList: [],
    finalImgList: [],
    modalShow: false,
    modalHeight: 400,
    nowInfoIndex: 0,
    stakeShow: false,
    timer: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this
    that.getSkill()

  },
  getImageInfo(e){
    this.setData({
      nowInfoIndex: e.detail.index,
      modalShow: true
    })
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false
    })
  },
  /**
   * 设置定时器
   */
  setTimer(){
    let promiseArr = [];
    let promise = new Promise((resolve, reject) => {
      //这里可以写要发的请求，这里以上传为例
      let timer = [];
      let temp
      that.data.finalSkillList.forEach(function(v,k){
        temp = setInterval(function(){
          setTimeout(function(){that.onDraw(k)}, 0)
        }, v.cool_time <= 0 ? 2 : v.cool_time * 2)
        //2对应1秒
        timer.push(temp)
      })
      that.setData({
        timer: timer
      })
    });
    promiseArr.push(promise)
    let promiseOther = new Promise((resolve, reject) => {
      //额外操作
      setInterval(function(){
        setTimeout(function(){
          if(that.data.energy !== 100){
            var energy = that.data.energy + 1
            if(energy > 100){
              energy = 100
            }
            that.setData({
              energy: energy
            })
          }
        }, 0)
      }, 100)
    });
    promiseArr.push(promiseOther)
//Promise.all处理promiseArr数组中的每一个promise对象
    Promise.all(promiseArr).then((result) => {
      //在存储对象的数组里的所有请求都完成时，会执行这里
      console.log(111)
    })
  },
  /**
   * 拖动、删除图片后的操作
   * @param e
   */
  updateImageList(e){
    // let temp = [];
    // e.detail.list.forEach(function(val,key){
    //   temp[val] = key
    // })
    this.setData({
      finalImgList: e.detail.list
    })
  },
  /**
   * 重置技能
   */
  resetSkill(){
    this.getSkill()
  },
  /**
   * 确认技能,准备伤害测试
   */
  confirmSkill(){
    let finalSkillList = [];
    let imgLink = []
    let nowImgLink = [];
    that.data.skillList.forEach(function(v,k){
      nowImgLink['https://mingtongct.com/images/skill/'+v.icon] = k
    })
    that.data.finalImgList.forEach(function(v,k){
      var imageUrl = 'https://mingtongct.com/images/skill/' + that.data.skillList[k].icon
      if(imageUrl !== v){
        imgLink[k] = v
      }else{
        finalSkillList[k] = that.data.skillList[k]
      }
    })
    imgLink.forEach(function(v,k){
      //替换顺序
      var nowIndex = nowImgLink[v]
      finalSkillList[k] = that.data.skillList[nowIndex]
    })
    let skillPositionArr = [];
    var length = finalSkillList.length
    for (var i=0;i<length;i++){
      skillPositionArr[i] = that.data.skillPositionArr[i]
    }
    this.setData({
      finalSkillList: finalSkillList,
      skillPositionArr: skillPositionArr,
      stakeShow: true
    })
    this.setTimer()
  },
  /**
   * 获取技能列表
   */
  getSkill(){
    let temp
    let tempLink
    let skillPositionArr = []
    let skillLink = []
    let imgList = [];

    const url = api.damageAPI + 'skill-list'
    const data = {version:2, oc:'zs'}
    wxutil.request.get(url, data).then((res) => {
      if(res.data.code === 200){
        res.data.data.forEach(function(v){
          temp = [
            {display:"none"},
            {display:"none"},
            {display:"none"},
            {display:"none"},
          ]
          tempLink = {inCD:false,tickID:0,stage:0}
          skillLink.push(tempLink)
          skillPositionArr.push(temp);
          imgList.push('https://mingtongct.com/images/skill/'+v.icon);
        })
        that.setData({
          skillList: res.data.data,
          finalSkillList: res.data.data,
          skillPositionArr: skillPositionArr,
          skillLink: skillLink,
          imgList:imgList,
          finalImgList:imgList
        })
      }
    })
  },
  test(){
    this.setData({
      energy: this.data.energy - 10
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
    this.data.timer.forEach(function(v){
      clearInterval(v);
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.data.timer.forEach(function(v){
      clearInterval(v);
    })
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
