const app = getApp()
const api = app.api
const wxutil = app.wxutil
Page({
  data: {
    multiArray: [],
    isSelect: false,
    multiIndex: [0, 0],
    handList: [],
    selectList: [],
    modalShow: false,
    modalHeight: 600,
    contentHeight: 150,
    scrollHeight:450,
    macroStr: '',
    logId: 0,
    inputType: 0, //显示类型 1技能 2物品 3喊话内容 4宠物技能
    checkboxStatusList: [],
    checkboxButtonList: [],
    checkboxCampList: [],
    campIndex:0,
    statusIndex:0,
    buttonIndex:0,
    enums:[
        '技能名称：',
        '物品名称：',
        '喊话内容：',
        '宠物技能：'
    ]
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
        let second = [];
        if(res.data.data.select_list[2].hasOwnProperty(0)){
          if(res.data.data.select_list[2][0].hasOwnProperty(0)){
            third = res.data.data.select_list[2][0]
          }
        }
        if(res.data.data.select_list[1].hasOwnProperty(0)){
          if(res.data.data.select_list[1][0].hasOwnProperty(0)){
            second = res.data.data.select_list[1][0]
          }
        }
        let multiArray = [];
        multiArray = [res.data.data.select_list[0], second, third]
        that.setData({
          handList: res.data.data.list,
          selectList: res.data.data.select_list,
          checkboxStatusList: res.data.data.checkbox_status_list,
          checkboxButtonList: res.data.data.checkbox_button_list,
          checkboxCampList: res.data.data.checkbox_camp_list,
          multiArray:multiArray
        })
      }
    })
  },
  //重置表单
  onReset(){
    wx.lin.resetForm('macro');
  },
  submit(e){
    const url = api.macroAPI + 'hand-combine'

    let data = {
      camp_index: this.data.campIndex,
      status_index: this.data.statusIndex,
      button_index: this.data.buttonIndex,
      action: this.data.multiIndex
    }
    if(e.detail.values.content){
      data.content = e.detail.values.content
    }
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
  bindCampChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      campIndex: e.detail.value
    })
  },
  bindStatusChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      statusIndex: e.detail.value
    })
  },
  bindButtonChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      buttonIndex: e.detail.value
    })
  },

  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let inputType = e.detail.value[0] + 1;
    if(inputType === 4){
      if(this.data.handList[e.detail.value[0]].child[e.detail.value[1]].child.length <= 0){
        inputType = 0
      }
    }
    if(inputType === 0 || inputType === 3){
      this.setData({
        campIndex: 0,
        statusIndex: 0,
        buttonIndex: 0
      })
    }
    this.setData({
      multiIndex: e.detail.value,
      inputType: inputType,
      isSelect: true
    })
  },
  //选择器change事件
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    const key = e.detail.column + 1
    if(key === 2) {
      //滚动第二列
      data.multiArray[key] = []
      if(this.data.selectList[key].hasOwnProperty(this.data.multiIndex[0])){
        if(this.data.selectList[key][this.data.multiIndex[0]].hasOwnProperty(e.detail.value)){
          data.multiArray[key] = this.data.selectList[key][this.data.multiIndex[0]][e.detail.value];
        }
      }
    }else if(key === 1){
      //滚动第一列
      //设置第二列的值
      if(this.data.selectList[key].hasOwnProperty(0)){
        if(this.data.selectList[key][e.detail.value].hasOwnProperty(0)){
          data.multiArray[key] = this.data.selectList[key][e.detail.value];
        }
      }
      //设置第三列的值
      data.multiArray[2] = []
      if(this.data.selectList[2].hasOwnProperty(e.detail.value)){
        if(this.data.selectList[2][e.detail.value].hasOwnProperty(0)){
          data.multiArray[2] = this.data.selectList[2][e.detail.value][0];
        }
      }
    }


    switch (e.detail.column) {
      case 0:
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      case 1:
        data.multiIndex[2] = 0;
        break;
    }
    console.log(data.multiIndex);

    this.setData(data);
    console.log(this.data.multiArray);
  },
  onShareAppMessage(options) {
  }
})
