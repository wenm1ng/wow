const app = getApp()
const api = app.api

Page({
  properties: {
    isEmptyContent:{
      type:Number,  //type：作用是指明proID这个值的类型
      value:0      //默认值
    }
  },
  data: {
    isShow: false,//控制emoji表情是否显示
    isLoad: true,//解决初试加载时emoji动画执行一次
    content: "",//评论框的内容
    isLoading: true,//是否显示加载数据提示
    disabled: true,
    cfBg: false,
    _index: 0,
    comments:'',
    textPosition: 0,
    emojiChar: "☺-😋-😌-😍-😏-😜-😝-😞-😔-😪-😭-😁-😂-😃-😅-😆-👿-😒-😓-😔-😏-😖-😘-😚-😒-😡-😢-😣-😤-😢-😨-😳-😵-😷-😸-😻-😼-😽-😾-😿-🙊-🙋-🙏-✈-🚇-🚃-🚌-🍄-🍅-🍆-🍇-🍈-🍉-🍑-🍒-🍓-🐔-🐶-🐷-👦-👧-👱-👩-👰-👨-👲-👳-💃-💄-💅-💆-💇-🌹-💑-💓-💘-🚲",
    //0x1f---
    emoji: [
      "01", "02", "03", "04", "05", "06", "07", "08", "09","10",
      "11", "12", "13", "14", "15", "16", "17", "18", "19","20",
      "21", "22", "23", "24", "25", "26", "27", "28", "29","30",
      "31", "32", "33", "34", "35", "36", "37", "38", "39","40",
      "41", "42", "43", "44", "45", "46", "47", "48", "49","50",
      "51", "52", "53", "54", "55",
    ],
    imageBrowUrl: api.imageBrowUrl,
    emojis: [{char: "☺", emoji: "01"},
      {char: "😋", emoji: "02"},
      {char: "😌", emoji: "03"},
      {char: "😍", emoji: "04"},
      {char: "😏", emoji: "05"},
      {char: "😜", emoji: "06"},
      {char: "😝", emoji: "07"},
      {char: "😞", emoji: "08"},
      {char: "😔", emoji: "09"},
      {char: "😪", emoji: "10"},
      {char: "😭", emoji: "11"},
      {char: "😁", emoji: "12"},
      {char: "😂", emoji: "13"},
      {char: "😃", emoji: "14"},
      {char: "😅", emoji: "15"},
      {char: "😆", emoji: "16"},
      {char: "👿", emoji: "17"},
      {char: "😒", emoji: "18"},
      {char: "😓", emoji: "19"},
      {char: "😔", emoji: "20"},
      {char: "😏", emoji: "21"},
      {char: "😖", emoji: "22"},
      {char: "😘", emoji: "23"},
      {char: "😚", emoji: "24"},
      {char: "😒", emoji: "25"},
      {char: "😡", emoji: "26"},
      {char: "😢", emoji: "27"},
      {char: "😣", emoji: "28"},
      {char: "😤", emoji: "29"},
      {char: "😢", emoji: "30"},
      {char: "😨", emoji: "31"},
      {char: "😳", emoji: "32"},
      {char: "😵", emoji: "33"},
      {char: "😷", emoji: "34"},
      {char: "😸", emoji: "35"},
      {char: "😻", emoji: "36"},
      {char: "😼", emoji: "37"},
      {char: "😽", emoji: "38"},
      {char: "😾", emoji: "39"},
      {char: "😿", emoji: "40"},
      {char: "🙊", emoji: "41"},
      {char: "🙋", emoji: "42"},
      {char: "🙏", emoji: "43"},
      {char: "✈", emoji: "44"},
      {char: "🚇", emoji: "45"},
      {char: "🚃", emoji: "46"},
      {char: "🚌", emoji: "47"},
      {char: "🍄", emoji: "48"},
      {char: "🍅", emoji: "49"},
      {char: "🍆", emoji: "50"},
      {char: "🍇", emoji: "51"},
      {char: "🍈", emoji: "52"},
      {char: "🍉", emoji: "53"},
      {char: "🍑", emoji: "54"},
      {char: "🍒", emoji: "55"}],//qq、微信原始表情
    alipayEmoji: [],//支付宝表情
  },
  // methods: {
    //解决滑动穿透问题
    emojiScroll: function (e) {
      // console.log(e)
    },
    //文本域失去焦点时 事件处理
    textAreaBlur: function (e) {
      //获取此时文本域值
      this.setData({
        content: e.detail.value,
        textPosition: e.detail.cursor
      })

    },
    textBlur: function(e){
      this.setData({
        textPosition: e.detail.cursor
      })
    },
    //文本域获得焦点事件处理
    textAreaFocus: function (e) {
      // this.setData({
      //   isShow: false,
      //   cfBg: false
      // })
      this.setData({
        textPosition: e.detail.cursor
      })
    },
    textAreaInput: function (e){
      this.setData({
        content: e.detail.value
      })
    },
    //点击表情显示隐藏表情盒子
    emojiShowHide: function () {
      this.setData({
        isShow: !this.data.isShow,
        isLoad: false,
        cfBg: !this.data.false
      })
    },
    //表情选择
    emojiChoose: function (e) {
      let that = this
      setTimeout(function () {
        //当前输入内容和表情合并
        let content = that.data.content;
        let beforeContent = content.substring(0, that.data.textPosition);
        let afterContent = '';
        if(content.length !== beforeContent.length){
          afterContent = content.substring(that.data.textPosition);
        }
        that.setData({
          content: beforeContent + e.currentTarget.dataset.emoji + afterContent,
          textPosition: that.data.textPosition + 2
        })
      }, 200)

      // this.triggerEvent('receiveEmoji', e.currentTarget.dataset.emoji)
    },
    //点击emoji背景遮罩隐藏emoji盒子
    cemojiCfBg: function () {
      this.setData({
        isShow: false,
        cfBg: false
      })
    },
    emptyContent: function(){
      this.setData({
        content: ''
      })
    },
    //发送评论评论 事件处理
    send: function () {
      var that = this, conArr = [];
      that.cemojiCfBg();
      //此处延迟的原因是 在点发送时 先执行失去文本焦点 再执行的send 事件 此时获取数据不正确 故手动延迟100毫秒
      setTimeout(function () {
        that.triggerEvent('sendMessage', that.data.content)
      }, 100)

      setTimeout(function () {
        if(that.properties.isEmptyContent === 1){
          that.setData({
            content: '',
            isEmptyContent: 0
          })
        }
      }, 100)
    }
  // }
  // onLoad: function (options) {
  //   // 页面初始化 options为页面跳转所带来的参数
  //   var em = {}, that = this, emChar = that.data.emojiChar.split("-");
  //   var emojis = []
  //   that.data.emoji.forEach(function (v, i) {
  //     em = {
  //       char: emChar[i],
  //       emoji: v
  //     };
  //     emojis.push(em)
  //   });
  //      that.setData({
  //       emojis: emojis
  //     })
  // },
  // onReady: function () {
  //   // 页面渲染完成
  // },


})
