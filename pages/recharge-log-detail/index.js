// pages/setting/index.js
const app = getApp()
const wxutil = app.wxutil

Page({
  data: {
    pay_type: 0,
    amount: 0,
    order_id: '',
    time: '',
  },
  onLoad(options) {
    this.setData({
      pay_type: options.pay_type,
      amount: options.amount,
      order_id: options.order_id,
      time: options.time,
    })
  },
})
