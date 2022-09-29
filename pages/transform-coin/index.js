// pages/setting/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    money:'',
    walletMoney: 0,
    luckyCoin:0,
    lastMoney: 0,
    rechargelist:[{id:0,sum:'5'},{id:1,sum:'10'},{id:2,sum:'20'},{id:3,sum:'50'},{id:4,sum:'100'},{id:5,sum:'200'}],
    select:'',
    errMessage: '',
    isIos: false,
    rate: 100
  },
  onLoad(options) {
    this.getMoney();
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
    const url = api.walletAPI + 'get-coin'
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          walletMoney: res.data.data['money'],
          luckyCoin: res.data.data['lucky_coin'],
          rate: res.data.data['rate']
        })
      }
    })
  },

  //帮币换幸运币
  toTransform(){
    if(this.data.lastMoney === 0){
      return;
    }
    const that = this

    wx.showModal({
      title: "提示",
      content: '您确定要用'+that.data.money+'帮币兑换'+that.data.lastMoney+'幸运币吗?',
      success: (res) => {
        if (res.confirm) {
          const url = api.walletAPI + 'add-lucky-coin'
          const data = {
            origin_type: 1,
            transform_type: 2,
            transform_money: this.data.lastMoney
          }
          wxutil.request.postLoad(url, data).then((res) => {
            if(res.data.code === 200){
              that.getMoney();
              wx.showToast({
                title: '转换成功',
                icon: 'success',
                duration: 2000//持续的时间
              })
            }else{
              wx.showToast({
                title: '转换失败',
                icon: 'error',
                duration: 2000//持续的时间
              })
            }
          })
        }
      }
    })
  },

  getAllMoney(){
    this.setData({
      money: Number(this.data.walletMoney),
      lastMoney: Number(this.data.walletMoney) * this.data.rate
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
    const walletMoney = Number(this.data.walletMoney)
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
    if(money > walletMoney){
      this.setData({
        money: walletMoney
      })
      money = walletMoney.toString()
    }
    let lastMoney = money.replace(/[^\d]/g,'')
    let lastMoney2 = Number(lastMoney);
    // if(lastMoney2 !== 0){
    //   lastMoney2 = lastMoney2.toFixed(2);
    // }
    this.setData({
      lastMoney: lastMoney2 * this.data.rate,
      money: lastMoney2
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
