// pages/setting/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    money:'',
    walletMoney: 0,
    lastMoney: 0,
    rechargelist:[{id:0,sum:'5'},{id:1,sum:'10'},{id:2,sum:'20'},{id:3,sum:'50'},{id:4,sum:'100'},{id:5,sum:'200'}],
    select:'',
    errMessage: '',
    isIos: false
  },
  onLoad(options) {
    if(options.money !== undefined){
      this.setData({
        walletMoney: options.money
      })
    }else{
      this.getMoney();
    }
    this.checkSystem();
  },

  showloading(){
    wx.showLoading({
      title:'加载中',
      mask:true,
      success(res){
        console.log(res);
      }
    })
    // 两秒之后关闭loading
    setTimeout(()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    },1000)
  },

  checkSystem(){
    let isIos = false
    try {
      const res = wx.getSystemInfoSync()
      if(res.platform === 'ios'){
        isIos = true;
        wx.setNavigationBarTitle({
          title: '补充帮币'
        })
      }else{
        wx.setNavigationBarTitle({
          title: '充值'
        })
      }
    } catch (e) {
      // Do something when catch error
      isIos = false;
    }
    this.setData({
      isIos: isIos
    })
  },

  recharge(e) {
    for(var i=0;i<this.data.rechargelist.length;i++){
      if (e.currentTarget.dataset.id === this.data.rechargelist[i].id) {
        this.setData({
          Select:e.currentTarget.dataset.id,
          active:'hover-button',
          theInput:this.data.rechargelist[i].sum,
          lastMoney: Number(this.data.rechargelist[i].sum).toFixed(2),
          errMessage: '',
          money: ''
        })
      }
    }
  },

  getMoney() {
    const url = api.userAPI + 'wallet/get-money?type=' + 1
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          walletMoney: res.data.data['money']
        })
      }
    })
  },

  toRecharge(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    const url = api.orderAPI + 'add-order'
    const money = Number(this.data.lastMoney)
    if(money <= 0){
      wx.showToast({
        title: '请选择您的充值数量！',
        icon: 'none',
        duration: 2000//持续的时间
      })
      return;
    }
    const data = {
      money: this.data.lastMoney,
      type: 1
    }
    const that = this;
    wxutil.request.post(url, data).then((res) => {
      if (res.data.code === 200) {
        wx.requestPayment({
          appId: res.data.data['addId'],
          timeStamp: res.data.data['timeStamp'],
          nonceStr: res.data.data['nonceStr'],
          package: res.data.data['package'],
          signType: res.data.data['signType'],
          paySign: res.data.data['paySign'],
          success (rs) {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            let lastPage = prevPage.route
            if(lastPage === 'pages/help-add/index'){
              wx.navigateBack({
                delta: 1,
                success: function(){
                  prevPage.getMoney()
                }
              })
            }else{
              that.getMoney();
            }
          },
          fail (rs) {
            wx.showToast({
              title: '取消充值',
              icon: 'error',
              duration: 2000//持续的时间
            })
          },
          complete(rs){
            console.log('回调结果：',rs);
          }
        })
      }else{
        wx.showToast({
          title: '充值失败',
          icon: 'error',
          duration: 2000//持续的时间
        })
      }
    })
  },

  /**
   * 金额校验
   */
  checkMoney(e){
    // let money = parseInt(e.detail.value);
    // if(money < 1 || money > 500){
    //   this.setData({
    //     errMessage: '充值金额必须在1-500之间'
    //   })
    // }
  },
  formatMoney(e){
    let money = e.detail.value
    this.setData({
      select: '',
      theInput: '',
      active: '',
      lastMoney: 0
    })
    if(money < 1){
      this.setData({
        money: ''
      })
    }
    if(money > 500){
      this.setData({
        money: 500
      })
      money = '500'
    }
    let lastMoney = money.replace(/[^\d]/g,'')
    console.log(lastMoney);
    let lastMoney2 = Number(lastMoney);
    if(lastMoney2 !== 0){
      lastMoney2 = lastMoney2.toFixed(2);
    }
    this.setData({
      lastMoney: lastMoney2
    })
    return lastMoney;
  },
  focusMoney(){
    this.setData({
      errMessage: ''
    })
  },

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
