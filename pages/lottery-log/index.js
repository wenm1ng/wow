// pages/topic-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 15 // 每页显示条数

Page({
  data: {
    scrollTop:0,
    height:400,
    userId: -1,
    page: 1,
    list: [],
    orderColumn: 'times',
    sort: 'desc',
    orderObj:{
      timesOrder: 'desc',
      sucTimesOrder: 'desc',
      rateOrder: 'desc',
    },
    showAction: false, // 是否显示操作菜单
    isEnd: false, // 是否到底onStarTap
    index: -1,
    isRequest:false, //是否正在处理请求
    isLoading:false,
    name: '' //坐骑名称
  },

  onLoad(options) {
    this.getScrollHeight();
    this.getLotteryLogList()
    this.getUserId()
  },

  onOrder(event){
    const orderColumn = event.currentTarget.dataset.order

    let sort;
    let sortName;
    if(orderColumn === 'times'){
      sort = this.setSort(this.data.orderObj.timesOrder)
      sortName = 'orderObj.timesOrder';
    }else if(orderColumn === 'suc_times'){
      sort = this.setSort(this.data.orderObj.sucTimesOrder)
      sortName = 'orderObj.sucTimesOrder';
    }else{
      sort = this.setSort(this.data.orderObj.rateOrder)
      sortName = 'orderObj.rateOrder';
    }
    this.setData({
      orderColumn: orderColumn,
      sort: sort,
      [sortName]: sort,
      page: 1
    })
    this.getLotteryLogList()
  },
  setSort(str){
    if(str === 'desc'){
      return 'asc'
    }
    return 'desc'
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
      page: 1
    })

    this.getLotteryLogList();
  },
  /**
   * 触底加载
   */
  scrollToLower() {
    const page = this.data.page
    this.setData({
      isLoading: true,
      page:page + 1
    })
    this.getLotteryLogList()
  },

  /**
   * 获取日志列表
   */
  getLotteryLogList() {
    const url = api.mountAPI + "lottery-log-list"
    const page = this.data.page;
    let data = {
      pageSize: pageSize,
      page: page,
      name: this.data.name,
      order: this.data.orderColumn,
      sort: this.data.sort
    }

    if (this.data.isEnd && page !== 1) {
      return
    }
    this.setData({
      isLoading:true
    })
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const list = res.data.data.list
        this.setData({
          page: (list.length === 0 && page !== 1) ? page - 1 : page,
          isEnd: ((list.length < pageSize) || (list.length === 0 && page !== 1)),
          list: page === 1 ? list : this.data.list.concat(list),
          isLoading: false
        })
      }
    })
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    if (app.getUserDetailNew()) {
      this.setData({
        userId: app.getUserDetailNew().id
      })
    }
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    const current = event.currentTarget.dataset.src

    const urls = [];
    var val = this.data.info.image_url
    urls.push(val)

    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  onShareAppMessage() {
    return {
      path: "/pages/lottery/index"
    }
  }
})
