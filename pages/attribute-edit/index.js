// pages/attribute-edit/index.js
import WxValidate from '../../utils/assets/plugins/wx-validate/WxValidate'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form:{
      power:'',  //力量
      agile:'',  //敏捷
      intelligence:'',  //智力
      spirit:'',  //精神
      strength:'',  //强度
      critical :'', //暴击率
      hit:'', //命中等级
      accurate:'',  //精准
      speed:'',  //速度
      endurance:'',  //耐力
      armor:'',  //护甲
      min_hurt:'',  //最小伤害
      max_hurt:'',  //最大伤害
    }
  },
  //验证函数
  initValidate() {
    const rules = {
      power: {
        required: true,
      },
      agile:{
        required:true,
      },
      intelligence:{
        required:true,
      },
      spirit:{
        required:true,
      },
      min_hurt:{
        required:true,
      },
      max_hurt:{
        required:true,
      },
      strength:{
        required:true,
      },
      critical:{
        required:true,
      },
      hit:{
        required:true,
      },
      accurate:{
        required:true,
      },
    }
    const messages = {
      power: {
        required: '请输入力量值',
      },
      agile:{
        required:'请输入敏捷值',
      },
      intelligence:{
        required:'请输入智力值',
      },
      spirit:{
        required:'请输入精神值',
      },
      min_hurt:{
        required:'请输入伤害最小值',
      },
      max_hurt:{
        required:'请输入伤害最大值',
      },
      strength:{
        required:'请输入强度值',
      },
      critical:{
        required:'请输入暴击率值',
      },
      hit:{
        required:'请输入命中等级值',
      },
      accurate:{
        required:'请输入精准值',
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },
  //调用验证函数
  formSubmit: function(e) {
    console.log(e);
    console.log('form发生了submit事件，携带的数据为：', e.detail.value)
    const params = e.detail.value;
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    this.showModal({
      msg: '提交成功'
    })
  },
  showModal(error) {
    wx.showModal({
        content: error.msg,
        showCancel: false,
        success:((res) => {
          if(res.confirm){
            wx.navigateTo({
              url: '/pages/B?flag =' + flag 
            })
          }
        })
    })
  },
  handleInputNumber(e) {
    let value = this.validateNumber(e.detail.value)
    switch(e.currentTarget.dataset.category){
      case 'power':
        this.setData({
          ['form.power']:value
        })
        break;
      case 'agile':
        this.setData({
          ['form.agile']:value
        })
        break;
      case 'intelligence':
        this.setData({
          ['form.intelligence']:value
        })
        break;
      case 'spirit':
        this.setData({
          ['form.spirit']:value
        })
        break;
      case 'strength':
        this.setData({
          ['form.strength']:value
        })
        break;
      case 'critical':
        this.setData({
          ['form.critical']:value
        })
        break;
      case 'hit':
        this.setData({
          ['form.hit']:value
        })
        break;
      case 'accurate':
        this.setData({
          ['form.accurate']:value
        })
        break;
      case 'speed':
        this.setData({
          ['form.speed']:value
        })
        break;
      case 'endurance':
        this.setData({
          ['form.endurance']:value
        })
        break;
      case 'armor':
        this.setData({
          ['form.armor']:value
        })
        break;
      case 'min_hurt':
        this.setData({
          ['form.min_hurt']:value
        })
        break;
      case 'max_hurt':
        this.setData({
          ['form.max_hurt']:value
        })
        break;
    }
    // this.setData({
    //   power,agile,intelligence,spirit,strength,critical,hit,accurate,speed,endurance,armor,min_hurt,max_hurt
    // })
  },
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initValidate()
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