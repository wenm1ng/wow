// pages/select-skill/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({

  /**
   * 页面的初始数据
   */
  data: {
    occupation:'',
    version:0,
    talentId:[],
    talentList:[],
    talentTreeList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      occupation: options.occupation,
      version: options.version
    })
    // this.getTalentList();
  },

  cacheImage(icon){
    var path = app.getCacheImage('icon:'+icon);
    if(!path){
      path = app.cacheImage(api.imageIconUrl + icon,'icon:'+icon);
    }
    return path;
  },

  getTalentList(){
    const that = this
    const data = {'version':this.data.version,'oc':this.data.occupation};
    const url = api.talentAPI+'get-talent-list'
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        var talentId = [];
        for(var index in res.data.data){
          if(res.data.data[index].icon !== ''){
            res.data.data[index].image_url = this.cacheImage(res.data.data[index].icon);
          }else{
            res.data.data[index].image_url = '';
          }
          talentId.push(res.data.data[index].talent_id);
        }
        this.setData({
          talentList: res.data.data,
          talentId: talentId
        })
        this.getTalentTreeList();
      }
    })
  },
  getTalentTreeList(){
    const that = this
    // console.log(this.data.talentId)
    const data = {'version':this.data.version,'oc':this.data.occupation,'talent_id':this.data.talentId};
    // console.log(data)
    const url = api.talentAPI+'get-talent-tree-list'
    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        for(var index in res.data.data){
          for(var key in res.data.data[index]){
            res.data.data[index][key].image_url = this.cacheImage(res.data.data[index][key].icon);
          }
        }
        that.setData({
          talentTreeList: res.data.data
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