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
    modalMyShow: false,
    modalHeight: 600,
    contentHeight: 150,
    scrollHeight:450,
    macroStr: '',
    logId: 0,
    inputType: 0, //显示类型 1技能 2物品 3喊话内容 4宠物技能
    checkboxStatusList: [],
    checkboxButtonList: [],
    checkboxCampList: [],
    checkboxCommonList: [],
    checkboxPlayerList: [],
    campIndex:0,
    statusIndex:0,
    buttonIndex:0,
    commonIndex:0,
    playerIndex:0,
    content: '',
    name: '',
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
  updateMacro(e){
    this.setData({
      macroStr: e.detail.value
    })
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
          checkboxCommonList: res.data.data.checkbox_common_list,
          checkboxPlayerList: res.data.data.checkbox_player_list,
          multiArray:multiArray
        })
      }
    })
  },
  //重置当前数据
  onReset(){
    this.setData({
      isSelect: false,
      multiIndex: [0, 0],
      inputType: 0,
      campIndex:0,
      statusIndex:0,
      buttonIndex:0,
      commonIndex:0,
      playerIndex:0,
      content: '',
    })
  },
  //重置所有数据
  onResetAll(){
    this.setData({
      isSelect: false,
      multiIndex: [0, 0],
      macroStr: '',
      logId: 0,
      inputType: 0,
      campIndex:0,
      statusIndex:0,
      buttonIndex:0,
      commonIndex:0,
      playerIndex:0,
      content: '',
      name: '',
    })
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false,
    })
  },
  closeMyModal(){
    wx.lin.resetForm('macroName');
    this.setData({
      modalMyShow: false,
    })
  },
  //保存到我的宏
  saveMacro(e){
    console.log(e.detail.values);

    if(e.detail.values.name === ''){
      wx.showToast({
        title: '宏名称不能为空',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return;
    }
    const that = this
    app.saveMacro(this.data.logId, e.detail.values.name, that.data.macroStr, function(){
      that.closeMyModal()
    })
  },
  showMyModal(){
    this.setData({
      modalMyShow: true,
    })
  },
  //复制宏
  copyStr(){
    wx.setClipboardData({
      data:this.data.macroStr,//要复制的数据
      success (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000//持续的时间
        })
      }
    })
  },
  submit(e){
    if(!this.data.isSelect){
      wx.showToast({
        title: '请选择动作',
        icon: 'error',
        duration: 2000//持续的时间
      })
      return;
    }
    const url = api.macroAPI + 'hand-combine'

    let data = {
      camp_index: this.data.campIndex,
      status_index: this.data.statusIndex,
      button_index: this.data.buttonIndex,
      common_index: this.data.commonIndex,
      player_index: this.data.playerIndex,
      action: this.data.multiIndex,
      id: this.data.logId,
      macro_str: this.data.macroStr
    }
    if(e.detail.values){
      if(e.detail.values.content === ''){
        wx.showToast({
          title: '请输入必填信息',
          icon: 'error',
          duration: 2000//持续的时间
        })
        return;
      }
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
  bindCommonChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      commonIndex: e.detail.value
    })
  },
  bindPlayerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      playerIndex: e.detail.value
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
        buttonIndex: 0,
        commonIndex: 0,
        playerIndex: 0
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
