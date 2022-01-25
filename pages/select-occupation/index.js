// pages/select-occupation/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({

  /**
   * 页面的初始数据
   */
  data: {
    occupation_list:[], //版本列表
    version:0
  },

  //选好职业后下一个页面
  nextPage(e){
    let occupation = e.currentTarget.dataset.occupation;
    wx.navigateTo({
      url: "/pages/select-skill/index?occupation=" + occupation + "&version=" + this.version
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad: function (options) {
    this.version = options.version;
    this.getOccupationList(options.version)
  },

  cacheImage(oc){
    var path = app.getCacheImage('oc:'+oc);
    if(!path){
      path = app.cacheImage(api.imageBgUrl + oc + '.png','oc:'+oc);
    }
    return path;
  },

  getOccupationList(version) {
    version = parseInt(version);
    console.log(version);
    const url = api.occupationAPI+'get-occupation-list'
    const data = {'version':version}
    var that = this

    if(app.globalData.occupation_list){
      this.setData({
        occupation_list: []
      })
      for(var index in app.globalData.occupation_list){
        if(index != version){
          continue;
        }
        console.log(index);
        if(app.globalData.occupation_list[index] !== undefined){
          this.setData({
            occupation_list: app.globalData.occupation_list[index]
          })
        }
      }
      console.log(this.data.occupation_list)
      if(this.data.occupation_list.length == 0){
        this.curlOccupationList(url,data)
      }
    }else{
      this.curlOccupationList(url,data)
    }
  },
  curlOccupationList(url, data){
    const that = this
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        var version = parseInt(data.version);
        if(!app.globalData.occupation_list){
          app.globalData.occupation_list = [];
        }
        for(var index in res.data.data){
          res.data.data[index].image_url = this.cacheImage(res.data.data[index].occupation);
        }
        app.globalData.occupation_list[version] = res.data.data;
        this.setData({
          occupation_list: res.data.data
        })
      }
    })
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