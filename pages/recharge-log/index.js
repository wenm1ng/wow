// pages/recharge-log/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 10 // 每页显示条数

Page({
  data: {
    startDate: '2020-01',
    endDate: wxutil.getYearMonth(),
    date: wxutil.getYearMonth(),
    dateFormat: '',
    logList: [],
    page: 1,
    isScroll: true,
    height:1300,
    scrollTop: 0,
    inRequest: false,
    isEnd: false,
    loading: false
  },
  onLoad() {
    this.setData({
      dateFormat: this.getDateFormat(this.data.date)
    })
    this.getLogList();
  },
  /**
   * 获取日志列表
   */
  getLogList(){
    const page = this.data.page

    const url = api.orderAPI+'log-list'
    const data = {
      page: page,
      pageSize: pageSize
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
        this.setData({
          page: (logList.length === 0 && page !== 1) ? page - 1 : page,
          loading: false,
          inRequest: false,
          isEnd: ((logList.length < pageSize) || (logList.length === 0 && page !== 1)),
          logList: page === 1 ? logList : this.data.logList.concat(logList)
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

  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value,
      dateFormat: this.getDateFormat(e.detail.value)
    })
  },
  getDateFormat(date){
    return date.replace('-', '年') + '月'
  }
})
