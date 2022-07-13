const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab_list:[],
    version_list:[],
    checkVersion:0, //选中的版本
    checkTab:0, //选中的tab标题
    version:1
  },
  //选好wa信息后下一个页面
  nextPage(e){
    let ocName = e.currentTarget.dataset.oc_name ? e.currentTarget.dataset.oc_name : '';
    let type = e.currentTarget.dataset.type ? e.currentTarget.dataset.type : '';
    let ttId = e.currentTarget.dataset.tt_id ? e.currentTarget.dataset.tt_id : '';
    console.log(ttId)
    let occupation = e.currentTarget.dataset.occupation ? e.currentTarget.dataset.occupation : '';
    wx.navigateTo({
      url: "/pages/wa-list/index?talentName=" + ocName + "&type="+ type + "&version=" + this.data.version + "&ttId=" + ttId + "&occupation=" + occupation
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getVersionList();
    this.getTabList();
  },

  /**
   * 搜索
   */
  doSearch(e){
    if(e.detail.value === ''){
      wx.showToast({
        title: '内容不能为空!',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return
    }
    wx.navigateTo({
      url: "/pages/wa-list/index?searchValue=" + e.detail.value
    })
  },

  //获取watab列表
  bindVersion(e) {
    let version = e.currentTarget.dataset.version
    let index = e.currentTarget.dataset.index
    this.setData({
      version: version,
      checkVersion: index
    })

    this.getTabList();
  },

  bindTab(e){
    this.setData({
      checkTab: e.currentTarget.dataset.index
    })
  },
  getTabList(){
    const url = api.waAPI+'get-tab-list?version='+ this.data.version
    const data = {}
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          tab_list: res.data.data
        })
      }
    })
  },

  //获取版本列表
  getVersionList() {
    const that = this
    const url = api.versionAPI+'get-version-list'
    const data = {}
    if(app.globalData.version_list){
      this.setData({
        version_list: app.globalData.version_list
      })
    }else{
      wxutil.request.get(url, data).then((res) => {
        if (res.data.code == 200) {
          for(var index in res.data.data){
            var val = res.data.data[index]
            var path = app.getCacheImage('versions:'+val.version);
            if(!path){
              path = app.cacheImage(api.imageBgUrl + val.version + '.png','versions:'+val.version);
            }
            res.data.data[index].image_url = path;
          }
          app.globalData.version_list = res.data.data
          this.setData({
            version_list: res.data.data
          })
        }
      })
    }
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
