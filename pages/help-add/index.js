// pages/help-add/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

import WeCropper from "../../templates/we-cropper/we-cropper.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    version_list:[],
    formData:{
      // title: '',
      // description: ''
    },
    hasCoin:false,
    isMaxSize: false,
    imageUrl: [],
    isClear: false,
    money: '',
    selectMoney: '',
    walletMoney: 0,
    moneyCheck: false
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
    let {
      cropperOpt
    } = this.data

    if (options.src) {
      cropperOpt.src = options.src
    }
    this.getMoney()
    // 实例化WeCropper
    this.cropper = new WeCropper(cropperOpt)
    .on("beforeImageLoad", (ctx) => {
      wx.showToast({
        title: "上传中",
        icon: "loading"
      })
    })
    .on("imageLoad", (ctx) => {
      wx.hideToast()
    })
  },

  getMoney() {
    const url = api.userAPI + 'wallet/get-money?type=' + 1
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          walletMoney: parseFloat(res.data.data['money'])
        })
      }
    })
  },

  buttonClick(e) {
    let type = e.target.dataset.type;
    let value = e.target.dataset.value;

    if(type === 'coin'){
      this.setData({
        selectMoney: value,
        money: ''
      })
      this.getMoney()
      this.showToastMoney(value)
    }

    type = 'formData.'+ type;
    this.setData({
      [type]: value
    })
  },
  gotoDescription(){
    let description = this.data.formData.description ? this.data.formData.description : ''
    console.log(description);
    wx.navigateTo({
      url: '/pages/help-add-description/index?description=' + description + '&from=help'
    })
  },
  clickMoneyButton(){
    this.setData({
      money: ''
    })
  },
  /**
   * 上传图片超过2m
   */
  onImageMaxSize(){
    wx.showToast({
      title: '图片不能超过10M',
      icon: 'error',
      duration: 2000//持续的时间
    })
    this.setData({
      isMaxSize: true
    })
  },
  /**
   * 移除图片
   */
  onImageRemove(){
    this.setData({
      imageUrl: []
    })
  },
  /**
   * 添加图片
   * @param e
   */
  onAddImage(e){
    console.log(e.detail.current);
    let url = e.detail.current[0].url;
    this.setData({
      imageUrl: [url]
    })
  },

  /**
   * 多图上传
   */
  addHelpUploadImage(curlData, imageFiles) {
    wx.showToast({
      title: "发布中...",
      icon: "loading"
    })
    const url = api.helpCenterAPI + "add"
    return Promise.all(imageFiles.map((imageFile) => {
      return new Promise(function (resolve, reject) {
        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: imageFile,
          data:curlData
        }).then((res) => {
          const data = JSON.parse(res.data);
          wx.hideToast()
          if (data.code === 200) {
            // resolve(data.data.url)
            wx.showToast({
              title: '发布成功',
              icon: 'success',
              duration: 2000,//持续的时间
              success() {
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];
                wx.navigateBack({
                  delta: 1,
                  success: function(){
                    prevPage.getHelpList()
                  }
                })
                // wx.navigateTo({
                //   url: "/pages/help/index"
                // })
              }
            })
          }else{
            wx.showToast({
              title: res.data.code !== 400 ? res.data.msg : '发布失败',
              icon: 'error',
              duration: 2000//持续的时间
            })
          }
        }).catch((error) => {
          reject(error)
        })
      })
    }))
  },

  addHelpNoImage(data){
    wx.showToast({
      title: "发布中...",
      icon: "loading"
    })
    const url = api.helpCenterAPI + "add"
    wxutil.request.post(url, data).then((res) => {
      wx.hideToast()
      if (res.data.code === 200) {
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000,//持续的时间
          success() {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            wx.navigateBack({
              delta: 1,
              success: function(){
                prevPage.getHelpList()
              }
            })
          }
        })
      }else{
        wx.showToast({
          title: res.data.code !== 400 ? res.data.msg : '发布失败',
          icon: 'error',
          duration: 2000//持续的时间
        })
      }
    })
  },
  /**
   * 重置formData
   */
  onResetAnswer(){
    this.setData({
      formData: {},
      isClear: true
    })

  },
  onAddAnswer(){
    if(!this.onChek()){
      return;
    }

    wx.showModal({
      title: "提示",
      content: "为了社区的良好环境,请您及时采纳回答!",
      success: (res) => {
        if (res.confirm) {
          if(this.data.imageUrl.length !== 0){
            //有上传图片，进行上传图片请求
            this.addHelpUploadImage(this.data.formData, this.data.imageUrl);
          }else{
            //普通post请求
            this.addHelpNoImage(this.data.formData);
          }
        }
      },
      fail: (res) => {
      },
    })
  },
  setAnswerTitle(e){
    this.setData({
      ['formData.title']: e.detail.value
    })
  },

  formatMoney(e){
    let money = e.detail.value
    if(money < 1){
      this.setData({
        money: ''
      })
    }
    if(money > 50){
      this.setData({
        money: 50
      })
      money = '50'
    }
    this.setData({
      selectMoney: ''
    })
    return money.replace(/[^\d]/g,'')
  },

  /**
   * 去充值页面
   */
  gotoRecharge(event){
    if(!app.checkUserDetailGoAuth()){
      return;
    }

    wx.navigateTo({
      url: "/pages/recharge/index?money="+ this.data.walletMoney
    })
  },

  checkMoney(e){
    this.getMoney()
    let money = parseFloat(e.detail.value)
    if(money <= 0){
      return
    }
    this.setData({
      money: money
    })
    this.showToastMoney(money)
  },

  showToastMoney(money){
    let moneyCheck = true;
    if(money > this.data.walletMoney){
      wx.showToast({
        title: '帮币余额不足',
        icon: 'error',
        duration: 2000//持续的时间
      })
      moneyCheck = false;
    }
    this.setData({
      moneyCheck: moneyCheck
    })
  },

  /**
   * 字段校验
   */
  onChek(){
    console.log(this.data.formData);
    if(this.data.formData.version === undefined){
      wx.showToast({
        title: '请选择版本',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }

    if(this.data.formData.is_pay === undefined){
      wx.showToast({
        title: '请选择是否有偿',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }

    if(this.data.formData.help_type === undefined){
      wx.showToast({
        title: '请选择帮忙类型',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }

    if(this.data.formData.title === undefined){
      wx.showToast({
        title: '请输入帮忙标题',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }
    const title = this.data.formData.title.replace(/(^\s*)|(\s*$)/g, "");
    if(title === ''){
      wx.showToast({
        title: '请输入帮忙标题',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }


    if(this.data.formData.description === undefined){
      wx.showToast({
        title: '请输入帮忙描述',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }

    const description = this.data.formData.description.replace(/(^\s*)|(\s*$)/g, "");
    console.log(description);
    if(description === ''){
      wx.showToast({
        title: '请输入帮忙描述',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }

    if(this.data.money !== '') {
      this.setData({
        ['formData.coin']: this.data.money
      })
    }else if(this.data.is_pay === '1'){
      if(this.data.formData.coin === undefined){
        wx.showToast({
          title: '请选择奖励币数',
          icon: 'error',
          duration: 2000//持续的时间
        })
        return false;
      }else if(!this.data.moneyCheck){
        wx.showToast({
          title: '帮币余额不足',
          icon: 'error',
          duration: 2000//持续的时间
        })
        return false;
      }
    }

    if(this.data.isMaxSize){
      wx.showToast({
        title: '图片不能大于10M',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }
    return true;
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
    console.log(this.data.formData);
  },
  setDescription(event){
    this.setData({
      ['formData.description']: event.detail.value
    })
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
