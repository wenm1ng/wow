// pages/lottery/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    whether: false,
    flop:'点击开刷',
    really:'',
    implement: 0,
    surplus:false,
    biutin:'点击开刷',
    id: [],
    is_all: 0,
    type: 0,
    lotteryList: []
  },
  onLoad(options) {
    this.setData({
      id:options.id ? options.id : [],
      is_all: options.is_all ? options.is_all : 1
    })
  },
  doLottery(event){
    const type = event.currentTarget.dataset.type
    const url = api.mountAPI + 'lottery';
    const data = {
      id: this.data.id,
      is_all: this.data.is_all,
      type:type
    }
    wxutil.request.post(url, data).then((res) => {
      wx.showLoading({
        title: '刷坐骑中...',
      });
      if (res.data.code === 200) {
        this.setData({
          lotteryList: res.data.data,
          type: type
        })
      }
      wx.hideLoading()
    })
  },
  again:function(e){
    if (this.data.implement == 3 || this.data.implement == 0){
      this.setData({
        whether: false,
        flop: '点击开刷',
        really: '',
        implement: 0,
        surplus: false,
        biutin: '点击开刷',
      })
    }else{
      wx.showToast({
        title: '正在执行抽奖中...',
        icon: 'none',
        duration: 2000
      })
      return false
    }
  },
  tamin:function(e){
    let that = this
    let index = e.currentTarget.dataset.index
    let lotteryList = this.data.lotteryList;
    lotteryList[index].is_open = 1;
    that.setData({
      lotteryList: lotteryList,
    })
    setTimeout(function () {
      lotteryList[index].title = '';

      that.setData({
        lotteryList: lotteryList,
      })
    }, 500)
    setTimeout(function () {
      lotteryList[index].is_show_image = 1;

      that.setData({
        lotteryList: lotteryList,
      })
    }, 1200)
    // setTimeout(function () {
    //   that.setData({
    //     biutin: '',
    //   })
    // }, 1700)
    // setTimeout(function () {
    //   that.setData({
    //     biutin: '没有奖品',
    //     implement:3,
    //   })
    // }, 2500)
  },

  onShareAppMessage(options) {
  }
})
