// pages/select-talent/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg:"" //背景图片
  },

  //选好职业后下一个页面
  nextPage(e){
    let occupation = e.currentTarget.dataset.occupation;
    wx.navigateTo({
      url: "/pages/select-skill/index?occupation=" + occupation
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad: function (options) {
    this.getTalentList(options.version, options.oc)
    this.getTalentTreeList(options.version)
  },

  getTalentList(version, oc) {
    version = parseInt(version);
    const url = api.talentAPI+'get-talent-list'
    const data = {'version':version, 'oc':oc}
    var that = this

    if(app.globalData.talent_list){
      for(var index in app.globalData.talent_list){
        if(index != version){
          continue;
        }
        console.log(app.globalData.talent_list[index])
        this.setData({
          talent_list: app.globalData.talent_list[index]
        })
      }
      console.log(this.data.talent_list)
      if(!this.data.talent_list){
        this.curlTalentList(url,data)
      }
    }else{
      this.curlTalentList(url,data)
    }
  },
  curlTalentList(url, data){
    const that = this
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        var version = parseInt(data.version);
        app.globalData.occupation_list = [];
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