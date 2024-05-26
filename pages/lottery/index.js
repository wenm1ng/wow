// pages/lottery/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
// 在页面中定义激励视频广告
let videoAd = null

Page({
  data: {
    isplay:false,//是否观看广告
    adLotteryTimes: 0,
    nowLotteryTimes: 0,
    whether: false,
    flop:'点击开刷',
    really:'',
    implement: 0,
    surplus:false,
    biutin:'点击开刷',
    id: [],
    mountId: [],
    name:[],
    times: 0,
    labelIndex: '-1',
    is_all: 0,
    origin_is_all: 0,
    type: 0,
    lotteryList: [],
    modalShow: false,
    lotteryModalShow: false,
    nowImageUrl: 'https://mingtongct.com/images/mount/argusfelstalkermountred.jpg',
    nowName: '奥利瑟拉佐尔的烈焰之爪',
    one: 0,
    // bingoList: [{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"},{name:"奥利瑟拉佐尔的烈焰之爪",image_url:"https://mingtongct.com/images/mount/argusfelstalkermountred.jpg"}],
    bingoList: [],
    lengths: 0,
    lotteryModalHeight: 650,
    lotteryModalScrollHeight: 500,
    modalHeight: 650,
    mountView: 200,
    mountWidth: 150,
    mountHeight: 150,
    isLotterying: false, //正在抽奖
    showPopup: false, //标签筛选
    showConfirm: false, //confirm框
    height: 600,
    scrollTop: 0,
    lotteryScrollTop: 0,
    luckyCoin: '', //幸运币
  },
  onLoad(options) {
    console.log(options);
    this.setData({
      id:options.id ? JSON.parse(options.id) : [],
      name:options.name ? JSON.parse(options.name) : [],
      adLotteryTimes: options.times ? options.times : 3,
      is_all: options.is_all ? options.is_all : 1,
      origin_is_all: options.is_all? options.is_all: 1
    })
    if(this.data.id.length === 1){
      this.setData({
        labelIndex: 0
      })
    }
    this.getScrollHeight()
    // 在页面onLoad回调事件中创建激励视频广告实例
    var n = this;
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-6d89ff8493103856'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {
        console.error('激励视频光告加载失败', err)
      })
      videoAd.onClose((res) => {
        if(res && res.isEnded){
          // 正常播放结束，可以下发游戏奖励
          n.setData({
            isplay: true,
            nowLotteryTimes: n.data.adLotteryTimes
          })
          n.howManyTimesLottery()
        }
      })
      // 用户点击了【关闭广告】按钮
    }
    // this.getLuckyCoin()
  },
  //记录标签modal滚动位置
  onRecordTop(e){
    this.setData({
      scrollTop: e.detail.scrollTop
    })
  },
  onLotteryRecordTop(e){
    this.setData({
      lotteryScrollTop: e.detail.scrollTop
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
  //选择一个坐骑进行必中刷坐骑
  onChoseLottery(event){
    const index = event.currentTarget.dataset.index;
    this.setData({
      labelIndex: index,
      lotteryModalShow: false
    })
    this.howManyTimesLottery()
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false,
      times: 0
    })
  },
  closeLotteryModal(){
    this.setData({
      lotteryModalShow: false
    })
  },
  openLotteryModal(){
    this.setData({
      lotteryModalShow: true
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
  //刷出坐骑需要多少次
  howManyTimesLottery(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    let that = this
    if(that.data.isLotterying){
      return;
    }

    const url = api.mountAPI + 'brushed_lottery';
    const index = parseInt(this.data.labelIndex);

    if(index === -1){
      //有多个坐骑，选择一个坐骑
      this.openLotteryModal()
      return;
    }
    if (this.data.isplay && this.data.nowLotteryTimes > 0) {
      const data = {
        id: [this.data.id[index]]
      }
      that.setData({
        isLotterying: true,
      })
      wx.showLoading({
        title: '刷坐骑中...',
      });
      wxutil.request.post(url, data).then((res) => {
        if (res.data.code === 200) {
          const length = res.data.data['list'].length
          that.setData({
            lotteryList: res.data.data['list'],
            type: res.data.data['type'],
            one: 1,
            lengths: length,
            times: res.data.data['times'],
            nowLotteryTimes: that.data.nowLotteryTimes - 1
          })
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
          } else if(bingoLength === 3 ){
            mountView = 200
            mountWidth = 150
            mountHeight = 150
            modalHeight = 500
          }else if(bingoLength <= 6){
            mountView = 200
            mountWidth = 150
            mountHeight = 150
            modalHeight = 700
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
          setTimeout(function(){
            for (let i = 0;i < length; i++){
              that.turnOver(i)
              if(res.data.data['list'][i].is_bingo === 1){
                bingoList.push(res.data.data['list'][i])
              }
            }
          },200)

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
    } else {
      const _this = this;
      wx.showModal({
        title: '温馨提示',
        content: '看激励视频广告发放奖励，谢谢支持',
        success(res) {
          if (res.confirm) {
            // 用户触发广告后，显示激励视频广告
            if (videoAd) {
              videoAd.show().catch(() => {
                // 失败重试
                videoAd.load()
                    .then(() => videoAd.show())
                    .catch(err => {
                      console.error('激励视频 广告显示失败', err)
                    })
              })
            }
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }

  },
  //刷坐骑
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
          } else if(bingoLength === 3 ){
            mountView = 200
            mountWidth = 150
            mountHeight = 150
            modalHeight = 500
          }else if(bingoLength <= 6){
            mountView = 200
            mountWidth = 150
            mountHeight = 150
            modalHeight = 700
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
          setTimeout(function(){
            for (let i = 0;i < length; i++){
              that.turnOver(i)
              if(res.data.data['list'][i].is_bingo === 1){
                bingoList.push(res.data.data['list'][i])
              }
            }
          },200)

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
    let time = 600 * (index + 1);
    setTimeout(function () {
      lotteryList[index].is_open = 1;
      // lotteryList[index].title = '';
      that.setData({
        lotteryList: lotteryList,
      })
    }, time)
    setTimeout(function () {
      lotteryList[index].is_show_image = 1;
      lotteryList[index].title = '';
      that.setData({
        lotteryList: lotteryList,
      })
      setTimeout(function () {
        lotteryList[index].title = lotteryList[index].name;

        that.setData({
          lotteryList: lotteryList,
        })
      },600)

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
