// pages/topic-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 7 // 每页显示条数

Page({
  data: {
    scrollTop:0,
    height:400,
    userId: -1,
    page: 1,
    list: [],
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
          height: height - 600,
        })
      }
    })
  },
  /**
   * 获取日志列表
   */
  getLotteryLogList(page = 1) {
    const url = api.mountAPI + "lottery-log-list"
    let data = {
      pageSize: pageSize,
      page: page,
      name: this.data.name
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
   * 加载更多评论
   */
  getMoreComments() {
    const page = this.data.page
    this.getComments(page + 1)
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
