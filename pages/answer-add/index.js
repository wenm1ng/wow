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
    formData:{},
    helpId:0,
    helpType:0,
    isMaxSize: false,
    imageUrl: [],
    isClear: false,
    isLoadingAddAnswer: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      helpId: options.helpId ? options.helpId : 0,
      helpType: options.helpType ? options.helpType : 0,
    })
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

  setAnswerWa(e){
    // console.log(e,1111111111111111111)
    // console.log(e.detail.value)
    this.setData({
      ['formData.wa_content']: e.detail.value
    })
  },

  buttonClick(e) {
    let type = e.target.dataset.type;
    type = 'formData.'+ type;
    let value = e.target.dataset.value;
    this.setData({
      [type]: value
    })
  },
  gotoDescription(){
    let description = this.data.formData.description ? this.data.formData.description : ''
    console.log(description);
    wx.navigateTo({
      url: '/pages/help-add-description/index?description=' + description + '&from=answer'
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
    const that = this;
    const url = api.helpCenterAPI + "add-answer"
    return Promise.all(imageFiles.map((imageFile) => {
      return new Promise(function (resolve, reject) {
        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: imageFile,
          data:curlData
        }).then((res) => {
          const data = JSON.parse(res.data);
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
          }else{
            wx.showToast({
              title: res.data.code !== 400 ? res.data.msg : '发布失败',
              icon: 'error',
              duration: 2000//持续的时间
            })
          }
          that.setData({
            isLoadingAddAnswer: false
          })
        }).catch((error) => {
          reject(error)
        })
      })
    }))
  },

  addHelpNoImage(data){
    const that = this
    const url = api.helpCenterAPI + "add-answer"
    wxutil.request.post(url, data).then((res) => {
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
          title: res.data.code !== 400 ? res.data.msg : '发布失败',
          icon: 'none',
          duration: 2000//持续的时间
        })
      }
      that.setData({
        isLoadingAddAnswer: false
      })
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
    getApp().preventActive(()=>{
      wx.showModal({
        title: "提示",
        content: '确定要提交吗?',
        success: (res) => {
          if (res.confirm) {
            const data = {...this.data.formData, ...{"help_id":this.data.helpId}}
            this.setData({
              isLoadingAddAnswer: true
            })
            if(this.data.imageUrl.length !== 0){
              //有上传图片，进行上传图片请求
              this.addHelpUploadImage(data, this.data.imageUrl);
            }else{
              //普通post请求
              this.addHelpNoImage(data);
            }
          }
        },
        fail: (res) => {
        },
      })
    })
  },
  setAnswerTitle(e){
    this.setData({
      ['formData.title']: e.detail.value
    })
  },
  /**
   * 字段校验
   */
  onChek(){

    if(this.data.formData.description === undefined){
      wx.showToast({
        title: '请输入帮忙描述',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
    }
    const description = this.data.formData.description.replace(/(^\s*)|(\s*$)/g, "");
    if(description === ''){
      wx.showToast({
        title: '请输入帮忙描述',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return false;
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
    return {
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
