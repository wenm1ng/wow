// pages/recharge-log/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 10 // 每页显示条数

Page({
  data: {
    startDate: '2020-01',
    endDate: wxutil.getYearMonth(),
    date: '',
    dateFormat: '',
    logList: false,
    page: 1,
    isScroll: true,
    height:1200,
    scrollTop: 0,
    inRequest: false,
    isEnd: false,
    loading: false
  },
  onLoad() {
    this.setData({
      dateFormat: this.getDateFormat(this.data.date)
    })
    console.log(Boolean(this.data.logList));
    this.getLogList();
    this.getScrollHeight()
  },
  /**
   * 获取日志列表
   */
  getLogList(){
    const page = this.data.page

    const url = api.orderAPI+'log-list'
    const data = {
      page: page,
      pageSize: pageSize,
      month: this.data.date
    }

    if ((this.data.isEnd && page !== 1) || this.data.inRequest) {
      return
    }

    this.setData({
      inRequest: true
    })

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const logList = res.data.data['list']
        const logCount = res.data.data['count'];
        let num = 0;
        let tmpLogList = this.data.logList;
        if(page !== 1){
          Object.keys(logList).map(key => {
            if(num === 0){
              console.log(Boolean(tmpLogList[key]))
              if(Boolean(tmpLogList[key]) !== false){
                tmpLogList[key] = tmpLogList[key].concat(logList[key]);
                num++
              }else{
                tmpLogList = {...this.data.logList, ...logList}
                return false;
              }
            }else{
              tmpLogList[key] = logList[key]
            }
          })
        }
        this.setData({
          page: (logCount === 0 && page !== 1) ? page - 1 : page,
          loading: false,
          inRequest: false,
          isEnd: ((logCount < pageSize) || (logCount === 0 && page !== 1)),
          logList: page === 1 ? logList : tmpLogList
        })
      }
    })
  },

  /**
   * 触底加载
   */
  scrollToLower() {
    const page = this.data.page
    this.setData({
      loading: true,
      page:page + 1
    })
    this.getLogList()
  },

  /**
   * 跳转到账单详情
   */
  gotoLogDetail(e){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    const pay_type = e.currentTarget.dataset.pay_type
    const amount = e.currentTarget.dataset.amount
    const order_id = e.currentTarget.dataset.order_id
    const time = e.currentTarget.dataset.time
    wx.navigateTo({
      url: "/pages/recharge-log-detail/index?pay_type="+ pay_type + '&amount='+amount+'&order_id='+order_id+'&time='+time
    })
  },

  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value,
      dateFormat: this.getDateFormat(e.detail.value),
      page: 1
    })
    this.getLogList()
  },
  getDateFormat(date){
    return date.replace('-', '年') + '月'
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
          height: height
        })
      }
    })
  },
  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
