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
    formData:{},
    hasCoin:false,
    isMaxSize: false,
    imageUrl: [],
    isClear: false,
    money: '',
    selectMoney: ''
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

  buttonClick(e) {
    let type = e.target.dataset.type;
    let value = e.target.dataset.value;

    if(type === 'coin'){
      this.setData({
        selectMoney: value,
        money: ''
      })
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
      url: '/pages/help-add-description/index?description=' + description
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
                wx.navigateBack({
                  delta:1
                })
              }
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
            wx.navigateBack({
              delta:1
            })
          }
        })
      }else{
        wx.showToast({
          title: '发布失败',
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
    // if(!this.onChek()){
    //   return;
    // }
    if(this.data.imageUrl.length !== 0){
      //有上传图片，进行上传图片请求
      this.addHelpUploadImage(this.data.formData, this.data.imageUrl);
    }else{
      //普通post请求
      this.addHelpNoImage(this.data.formData);
    }
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

    if(this.data.formData.description === undefined){
      wx.showToast({
        title: '请输入帮忙描述',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }

    if(this.data.isMaxSize){
      wx.showToast({
        title: '图片不能大于2M',
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
