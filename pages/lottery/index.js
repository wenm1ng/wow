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
    mountId: [],
    name:[],
    labelIndex: '-1',
    is_all: 0,
    origin_is_all: 0,
    type: 0,
    lotteryList: [],
    modalShow: false,
    nowImageUrl: 'https://mingtongct.com/images/mount/argusfelstalkermountred.jpg',
    nowName: '奥利瑟拉佐尔的烈焰之爪',
    one: 0,
    bingoList: [],
    lengths: 0,
    modalHeight: 650,
    mountView: 200,
    mountWidth: 150,
    mountHeight: 150,
    isLotterying: false, //正在抽奖
    showPopup: false, //标签筛选
    showConfirm: false, //confirm框
    height: 600,
    scrollTop: 0,
    luckyCoin: '', //幸运币
  },
  onLoad(options) {
    console.log(options);
    this.setData({
      id:options.id ? JSON.parse(options.id) : [],
      name:options.name ? JSON.parse(options.name) : [],
      is_all: options.is_all ? options.is_all : 1,
      origin_is_all: options.is_all? options.is_all: 1
    })
    this.getScrollHeight()
    // this.getLuckyCoin()
  },
  //记录标签modal滚动位置
  onRecordTop(e){
    this.setData({
      scrollTop: e.detail.scrollTop
    })
  },
  gotoTransformCoin(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    if(this.data.isLotterying){
      return;
    }
    wx.navigateTo({
      url: "/pages/wallet-detail/index"
    })
  },
  getLuckyCoin(){
    const url = api.walletAPI + 'get-lucky-coin'
    const that = this
    wxutil.request.post(url).then((res) => {
      if(res.data.code === 200){
        that.setData({
          luckyCoin : res.data.data['lucky_coin']
        })
      }
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
        that.setData({
          height: height - 100,
        })
      }
    })
  },
  /**
   * 展开或收起弹出层
   */
  togglePopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },
  onTagTap(event) {
    const index = event.currentTarget.dataset.index;
    let isAll = 0;
    if(index === '-1' && this.data.origin_is_all == 1){
      isAll = 1;
    }
    this.setData({
      labelIndex: index,
      is_all: isAll,
    })
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false
    })
  },
  gotoLotteryLog(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    if(this.data.isLotterying){
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
    let that = this
    if(that.data.isLotterying){
      return;
    }
    that.setData({
      isLotterying: true,
    })
    wx.showLoading({
      title: '刷坐骑中...',
    });
    const type = event.currentTarget.dataset.type
    const one = event.currentTarget.dataset.one
    const url = api.mountAPI + 'lottery';
    const index = parseInt(this.data.labelIndex);

    const data = {
      id: index === -1 ? this.data.id : [this.data.id[index]],
      is_all: this.data.is_all,
      type:type
    }
    wxutil.request.post(url, data).then((res) => {
      if (res.data.code === 200) {
        const length = res.data.data['list'].length
        that.setData({
          lotteryList: res.data.data['list'],
          type: type,
          one: one,
          lengths: length
        })
        if(one === '1'){
          let bingoList = [];
          for (let i = 0;i < length; i++){
            if(res.data.data['list'][i].is_bingo === 1){
              bingoList.push(res.data.data['list'][i])
            }
          }
          let mountView
          let mountWidth
          let mountHeight
          let bingoLength = bingoList.length
          let modalHeight = 650
          if(bingoLength === 1){
            mountView = 600
            mountWidth = 300
            mountHeight = 300
          } else if(bingoLength === 2 ){
            mountView = 300
            mountWidth = 300
            mountHeight = 300
          }else if(bingoLength <= 6){
            mountView = 200
            mountWidth = 150
            mountHeight = 150
          }else{
            mountView = 200
            mountWidth = 150
            mountHeight = 150
            modalHeight = 900
          }
          that.setData({
            bingoList: bingoList,
            mountView: mountView,
            mountWidth: mountWidth,
            mountHeight: mountHeight,
            modalHeight: modalHeight,
            // luckyCoin: this.data.luckyCoin - res.data.data['lucky_coin']
          })

          //一键十连刷
          for (let i = 0;i < length; i++){
            that.turnOver(i)
            if(res.data.data['list'][i].is_bingo === 1){
              bingoList.push(res.data.data['list'][i])
            }
          }
        }
      }else if(res.data.code === 40001){
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000//持续的时间
        })
        that.setData({
          isLotterying: false,
        })
      }else{
        wx.showToast({
          title: '操作失败',
          icon: 'error',
          duration: 2000//持续的时间
        })
        that.setData({
          isLotterying: false,
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
    let time = 1000 * (index + 1);
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
    return {
      title: this.data.bingoList.length > 0 ? "我刷到了“"+ this.data.bingoList[0].name +"”,你也来试试吧" : '模拟刷坐骑',
      imageUrl: this.data.bingoList[0].image_url ? this.data.bingoList[0].image_url : '',
      path: "/pages/mount/index"
    }
  }
})
