// pages/lottery/index.js
Page({
  data: {
    whether: false,
    flop:'点击翻牌',
    really:'',
    implement: 0,
    surplus:false,
    biutin:'点击翻牌',
  },
  onLoad(options) {
  },
  again:function(e){
    if (this.data.implement == 3 || this.data.implement == 0){
      this.setData({
        whether: false,
        flop: '点击翻牌',
        really: '',
        implement: 0,
        surplus: false,
        biutin: '点击翻牌',
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
    that.setData({
      // whether:true,
      really: index,
      implement:1,
    })
    setTimeout(function () {
      that.setData({
        flop: '',
      })
    }, 500)
    setTimeout(function () {
      that.setData({
        flop:'有奖品',
        // surplus:true,
        implement: 2,
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
