// pages/mount/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mountList:[],
    sort:'asc',
    name: '',
    height: 200,
    mountId: [],
    mountName: [],
    isAll: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getScrollHeight();
    this.getMountList();
  },
  getMountList(){
    const url = api.mountAPI + 'list'
    const data = {
      order: 'rate',
      sort: this.data.sort,
      name: this.data.name
    }
    wxutil.request.getLoad(url, data).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          mountList: res.data.data.list,
        })
      }
    })
  },
  gotoLottery(){
    if(this.data.mountId.length === 0){
      wx.showModal({
        title: "提示",
        content: '您还未选坐骑,将默认全选',
        success: (res) => {
          if (res.confirm) {
            this.selectAll('', 'all')
            this.nowGoLottery();
          }
        },
        fail: (res) => {
        },
      })
    }else{
      this.nowGoLottery();
    }
  },
  nowGoLottery(){
    wx.navigateTo({
      url: "/pages/lottery/index?id="+ JSON.stringify(this.data.mountId) + '&name=' + JSON.stringify(this.data.mountName) + '&is_all=' + this.data.isAll
    })
  },
  selectAll(event, type = 'reset'){
    if(type === 'reset'){
      type = event.currentTarget.dataset.type
    }
    const mountList = this.data.mountList
    const length = mountList.length
    var mountId = [];
    var mountName = [];
    let isAll;
    if(type === 'all'){
      for (var i = 0; i < length; i++){
        mountList[i].is_checked = true
        mountId.push(mountList[i].id)
        mountName.push(mountList[i].name)
      }
      isAll = 1;
    }else{
      for (var i = 0; i < length; i++){
        mountList[i].is_checked = false
      }
      mountId = [];
      mountName = [];
      isAll = 0;
    }
    this.setData({
      mountId: mountId,
      mountName: mountName,
      mountList: mountList,
      isAll: isAll
    })
  },
  onChecked(event){
    const index = event.currentTarget.dataset.index
    const mountList = this.data.mountList
    mountList[index].is_checked = !mountList[index].is_checked
    var mountId = this.data.mountId;
    var mountName = this.data.mountName;
    // console.log(mountId)
    if(mountList[index].is_checked){
      mountId.push(mountList[index].id)
      mountName.push(mountList[index].name)
    }else{
      // mountId.remove(mountList[index].id);
      mountId = app.arrRemoveObj(mountId, mountList[index].id);
      mountName = app.arrRemoveObj(mountName, mountList[index].name);
    }
    this.setData({
      mountList: mountList,
      mountId: mountId,
      mountName: mountName
    })
  },
  /**
   * 获取窗口高度
   */
  getScrollHeight() {
    const that = this;
    wx.getSystemInfo({
      success: function (res) {
        const windowHeight = res.windowHeight;
        const windowWidth = res.windowWidth;
        const ratio = 750 / windowWidth;
        const height = windowHeight * ratio;
        console.log(height);
        that.setData({
          height: height - 100,
        })
      }
    })
  },
  /**
   * 搜索
   */
  doSearch(e){
    this.setData({
      name: e.detail.value === undefined ? '' : e.detail.value,
    })

    this.getMountList();
  },

  onOrder(){
    this.setData({
      sort: this.setSort(this.data.sort)
    })
    this.getMountList()
  },
  setSort(str){
    if(str === 'desc'){
      return 'asc'
    }
    return 'desc'
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
