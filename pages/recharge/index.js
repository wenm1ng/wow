// pages/setting/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    money:'',
    rechargelist:[{id:0,sum:'5'},{id:1,sum:'10'},{id:2,sum:'20'},{id:3,sum:'50'},{id:4,sum:'100'},{id:5,sum:'200'}],
    select:'',
    errMessage: ''
  },
  onLoad() { },

  recharge(e) {
    for(var i=0;i<this.data.rechargelist.length;i++){
      if (e.currentTarget.dataset.id === this.data.rechargelist[i].id) {
        this.setData({
          Select:e.currentTarget.dataset.id,
          active:'hover-button',
          theInput:this.data.rechargelist[i].sum,
          errMessage: '',
          money: ''
        })
      }
    }
  },

  /**
   * 金额校验
   */
  checkMoney(e){
    let money = parseInt(e.detail.value);
    if(money < 1 || money > 500){
      this.setData({
        errMessage: '充值金额必须在1-500之间'
      })
    }
  },
  formatMoney(e){
    let pwd = e.detail.value
    this.setData({
      select: '',
      theInput: '',
      active: ''
    })
    return pwd.replace(/[^\d]/g,'')
  },
  focusMoney(){
    this.setData({
      errMessage: ''
    })
  }
})