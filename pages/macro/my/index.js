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
    orderColumn: 'update_at',
    sort: 'desc',
    orderObj:{
      timesOrder: 'desc',
    },
    showAction: false, // 是否显示操作菜单
    isEnd: false, // 是否到底onStarTap
    index: -1,
    isRequest:false, //是否正在处理请求
    isLoading:false,
    name: '', //搜索名称
    modalShow: false,
    modalHeight: 600,
    scrollHeight:450,
    id: '',
    macroName: '',
    macroStr: '',
    contentHeight: 50,
  },

  onLoad(options) {
    wx.lin.initValidateForm(this)
    this.getScrollHeight();
    this.getList()
    this.getUserId()
  },
  onShowDetail(event){
    this.setData({
      id: event.currentTarget.dataset.id,
      macroName: event.currentTarget.dataset.name,
      macroStr: event.currentTarget.dataset.content,
      modalShow: true,
      index: event.currentTarget.dataset.index
    })
  },
  //复制宏
  copyStr(){
    let that = this
    wx.setClipboardData({
      data:that.data.macroStr,//要复制的数据
      success (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000//持续的时间
        })
      },
      error (res){
        console.log(res)
      }
    })
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false,
    })
  },
  //保存到我的宏
  saveMacro(e){
    if(e.detail.values.name === ''){
      wx.showToast({
        title: '宏名称不能为空',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return;
    }
    if(e.detail.values.content === ''){
      wx.showToast({
        title: '宏内容不能为空',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return;
    }
    const that = this
    app.saveMacro(this.data.id, e.detail.values.name, e.detail.values.content, function(){
      that.getList()
    })
  },
  //删除宏
  delMacro(){
    const that = this
    wx.showModal({
      title: "提示",
      content: '确定要删除吗?',
      success: (res) => {
        if (res.confirm) {
          const url = api.macroAPI + 'del'
          wxutil.request.post(url, {id: this.data.id}).then((rs) => {
            if (rs.data.code === 200) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000//持续的时间
              })
              that.setData({
                modalShow: false
              })
              that.getList()
            }else{
              let msg = '删除失败';
              if(rs.data.code !== 400){
                msg = rs.data.msg
              }
              wx.showToast({
                title: msg,
                icon: 'error',
                duration: 2000//持续的时间
              })
            }
          })
        }
      },
      fail: (res) => {
      },
    })
  },
  onOrder(event){
    const orderColumn = event.currentTarget.dataset.order

    let sort;
    let sortName;
    if(orderColumn === 'update_at'){
      sort = this.setSort(this.data.orderObj.timesOrder)
      sortName = 'orderObj.timesOrder';
    }
    this.setData({
      orderColumn: orderColumn,
      sort: sort,
      [sortName]: sort,
      page: 1
    })
    this.getList()
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

    this.getList();
  },
  /**
   * 触底加载
   */
  scrollToLower() {
    console.log(11);
    const page = this.data.page
    this.setData({
      page:page + 1
    })
    this.getList()
  },

  /**
   * 获取日志列表
   */
  getList() {
    const url = api.macroAPI + "list"
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
        console.log(this.data.isEnd)
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
      path: "/pages/macro/index"
    }
  }
})
