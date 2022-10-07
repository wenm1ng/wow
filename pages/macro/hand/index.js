const app = getApp()
const api = app.api
const wxutil = app.wxutil
Page({
  data: {
    multiArray: [],
    multiIndex: [0, 0, 0],
    handList: [],
    selectFirstList: [],
    selectSecondList: [],
    selectThirdList: [],
    modalShow: false,
    modalHeight: 600,
    contentHeight: 150,
    scrollHeight:450,
    macroStr: '',
    logId: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.lin.initValidateForm(this)
    this.getHandList()
  },
  getHandList(){
    const url = api.macroAPI + 'tab-list'
    const that = this
    wxutil.request.get(url).then((res) => {
      if(res.data.code === 200){
        let third = [];
        if(res.data.data.select_third_list.hasOwnProperty(0)){
          if(res.data.data.select_third_list[0].hasOwnProperty(0)){
            third = res.data.data.select_third_list[0][0]
          }
        }
        that.setData({
          handList: res.data.data.list,
          selectFirstList: res.data.data.select_first_list,
          selectSecondList: res.data.data.select_second_list,
          selectThirdList: res.data.data.select_third_list,
          multiArray:[res.data.data.select_first_list, res.data.data.select_second_list[0], third]
        })
      }
    })
  },
  //重置表单
  onReset(){
    wx.lin.resetForm('macro');
  },
  submit(e){
    const url = api.macroAPI + 'group'
    const data = e.detail.values
    const that = this
    wxutil.request.post(url, data).then((res) => {
      if(res.data.code === 200){
        that.setData({
          macroStr: res.data.data.content,
          modalShow: true,
          logId: res.data.data.id
        })
      }
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = this.data.selectSecondList[0];
            data.multiArray[2] = this.data.selectThirdList[0][0];
            break;
          case 1:
            data.multiArray[1] = this.data.selectSecondList[1];
            data.multiArray[2] = this.data.selectThirdList[1][0];
            break;
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      case 1:
        switch (data.multiIndex[0]) {
          case 0:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = this.data.selectThirdList[0][0];
                break;
              case 1:
                data.multiArray[2] = this.data.selectThirdList[0][1];
                break;
              case 2:
                data.multiArray[2] = ['蚂蚁', '蚂蟥'];
                break;
              case 3:
                data.multiArray[2] = ['河蚌', '蜗牛', '蛞蝓'];
                break;
              case 4:
                data.multiArray[2] = ['昆虫', '甲壳动物', '蛛形动物', '多足动物'];
                break;
            }
            break;
          case 1:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['鲫鱼', '带鱼'];
                break;
              case 1:
                data.multiArray[2] = ['青蛙', '娃娃鱼'];
                break;
              case 2:
                data.multiArray[2] = ['蜥蜴', '龟', '壁虎'];
                break;
            }
            break;
        }
        data.multiIndex[2] = 0;
        break;
    }
    console.log(data.multiIndex);
    this.setData(data);
  },
  onShareAppMessage(options) {
  }
})
