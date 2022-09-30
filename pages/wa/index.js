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
    version:4
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

  gotoMount(){
    wx.switchTab({
      url: "/pages/tool-box/index"
    })
  },

  gotoHelp(){
    wx.switchTab({
      url: "/pages/help/index"
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
    this.setData({
      checkTab: 0
    })
    if(wxutil.getStorage('tab_list'+this.data.version)){
      this.setData({
        tab_list: wxutil.getStorage('tab_list'+this.data.version)
      })
      return;
    }
    const url = api.waAPI+'get-tab-list?version='+ this.data.version
    const data = {}
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        wxutil.setStorage('tab_list' + this.data.version, res.data.data, 3600 * 24);
        this.setData({
          tab_list: res.data.data
        })
      }
    })
  },

  //获取版本列表
  getVersionList() {
    const url = api.versionAPI+'get-version-list'
    const data = {}
    if(wxutil.getStorage('version_list')){
      const versionList = wxutil.getStorage('version_list');
      this.setData({
        version_list: versionList,
        version: versionList[0].version
      })
      return;
    }
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        wxutil.setStorage('version_list', res.data.data, 3600 * 24);
        this.setData({
          version_list: res.data.data,
          version: res.data.data[0].version
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
