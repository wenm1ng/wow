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
    modalShow: false,
    nowImageUrl: 'https://mingtongct.com/images/mount/argusfelstalkermountred.jpg',
    nowName: '奥利瑟拉佐尔的烈焰之爪',
    one: 0,
    bingoList: [], //中奖坐骑
    lengths: 0,
    mountView: 200,
    mountWidth: 150,
    mountHeight: 150,
    isLotterying: false, //正在抽奖
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
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    if(this.data.isLotterying){
      return;
    }
    this.setData({
      isLotterying: true,

    })
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
        const length = res.data.data.length
        that.setData({
          lotteryList: res.data.data,
          type: type,
          one: one,
          lengths: length
        })
        if(one === '1'){
          let bingoList = [];
          for (let i = 0;i < length; i++){
            if(res.data.data[i].is_bingo === 1){
              bingoList.push(res.data.data[i])
            }
          }
          let mountView
          let mountWidth
          let mountHeight
          let bingoLength = bingoList.length
          if(bingoLength === 1){
            mountView = 600
            mountWidth = 500
            mountHeight = 500
          } else if(bingoLength === 2 ){
            mountView = 300
            mountWidth = 300
            mountHeight = 300
          }else{
            mountView = 200
            mountWidth = 150
            mountHeight = 150
          }
          that.setData({
            bingoList: bingoList,
            mountView: mountView,
            mountWidth: mountWidth,
            mountHeight: mountHeight
          })
          console.log(that.data.mountView)
          //一键十连刷
          for (let i = 0;i < length; i++){
            that.turnOver(i)
            if(res.data.data[i].is_bingo === 1){
              bingoList.push(res.data.data[i])
            }
          }
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

    that.setData({
      lotteryList: lotteryList,
    })
    let time = 500 * (index + 1);
    setTimeout(function () {
      lotteryList[index].is_open = 1;
      // lotteryList[index].title = '';
      that.setData({
        lotteryList: lotteryList,
      })
    }, time)
    setTimeout(function () {
      lotteryList[index].is_show_image = 1;
      lotteryList[index].title = lotteryList[index].name;

      that.setData({
        lotteryList: lotteryList,
      })
      if(index === that.data.lengths - 1 && that.data.bingoList.length !== 0){
        that.setData({
          modalShow: true
        })
      }
      if(index === that.data.lengths - 1){
        that.setData({
          isLotterying: false
        })
      }
    }, time + 700)
  },
  onShareAppMessage(options) {
  }
})
