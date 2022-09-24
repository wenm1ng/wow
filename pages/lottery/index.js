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
    lotteryList: [],
    modalShow: true,
    nowImageUrl: 'https://mingtongct.com/images/mount/argusfelstalkermountred.jpg',
    nowName: '赤红兽',
    one: 0
  },
  onLoad(options) {
    this.setData({
      id:options.id ? options.id : [],
      is_all: options.is_all ? options.is_all : 1
    })
  },
  gotoLotteryLog(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    wx.navigateTo({
      url: "/pages/lottery-log/index"
    })
  },
  doLottery(event){
    wx.showLoading({
      title: '刷坐骑中...',
    });
    const type = event.currentTarget.dataset.type
    const one = event.currentTarget.dataset.one
    const url = api.mountAPI + 'lottery';
    const data = {
      id: this.data.id,
      is_all: this.data.is_all,
      type:type
    }
    let that = this;
    wxutil.request.post(url, data).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          lotteryList: res.data.data,
          type: type,
          one: one
        })
        if(one === '1'){
          //一键十连刷
          const length = res.data.data.length
          setTimeout(function(){
            for (var i = 0;i < length; i++){
              that.turnOver(i)
            }
          },500)
        }
      }else if(res.data.code === 40001){
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000//持续的时间
        })
      }else{
        wx.showToast({
          title: '操作失败',
          icon: 'error',
          duration: 2000//持续的时间
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
    let index = e.currentTarget.dataset.index
    this.turnOver(index)
    // let that = this
    // let lotteryList = this.data.lotteryList;
    // if(lotteryList[index].is_open === 1){
    //   return;
    // }
    // lotteryList[index].is_open = 1;
    //
    // that.setData({
    //   lotteryList: lotteryList,
    // })
    // setTimeout(function () {
    //   lotteryList[index].title = '';
    //   that.setData({
    //     lotteryList: lotteryList,
    //   })
    // }, 500)
    // setTimeout(function () {
    //   lotteryList[index].is_show_image = 1;
    //   lotteryList[index].title = lotteryList[index].name;
    //
    //   that.setData({
    //     lotteryList: lotteryList,
    //   })
    // }, 1200)

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
  //翻排
  turnOver(index){
    let that = this
    let lotteryList = this.data.lotteryList;
    if(lotteryList[index].is_open === 1){
      return;
    }
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
      lotteryList[index].title = lotteryList[index].name;

      that.setData({
        lotteryList: lotteryList,
      })
    }, 1200)
  },
  onShareAppMessage(options) {
  }
})
