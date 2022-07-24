// pages/chat-room/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const io = require("../../utils/socket.io")
let webSocket = null
var num = 0;//这是重连的次数
var t  = 5; // 这次每次重连的时间 默认为5秒之后
var setTimer = null; // 存放定时器  为了关闭用到的
var that;

Page({
  data: {
    content: null,
    userId: -1,
    scrollTop: 1000,
    timeDown: 0, // 大于5分钟消息间隔报时
    preTime: 0,// 上一条消息的时间
    countDown: 0, // 倒计时秒数
    height: 1116, // 消息内容区高度
    msg: [], //消息内容
    roomMembers: [], //房间成员
    automaticClose:true // 这里默认是客户端和服务器自动断开
  },
  connetWebsocket() { // wbsocket逻辑
    that = this;// 保存this指向
    if( webSocket ) that.closeWebSocket(); // 先关 再开 避免多次重复连接
    webSocket = wx.connectSocket({
      url: api.chatAPI,
      header:{
        'content-type': 'application/json'
      }
    })
    wx.onSocketOpen(function (res) { // 打开webSocket
      wx.sendSocketMessage({
        data:JSON.stringify({
          action: 'entryRoom',
          token: app.globalData.userDetail.token
        })
      })
    })

    wx.onSocketMessage(function (res) { // 接收数据
      let data = JSON.parse(res.data);
      switch (data.action) {
        case 'speak':
          that.onMessage(data)
          break;
        case 'entryRoom':
          that.onEntryRoom()
          break;
      }
    })
    wx.onSocketError(function(){  //这里是监听链接出错
      that.readConnectWebSocket()
    })
    wx.onSocketClose(function (res) { //监测webSocket关闭
      that.data.automaticClose && that.readConnectWebSocket()  // 只有是自动断开时才开启重连 这判断挺重要
    })
  },
  /**
   * 消息处理
   * @param res
   */
  onMessage(res){
    let msg = this.data.msg
    let preTime = this.data.preTime
    let nowTime = Date.parse(new Date())/1000;
    // 间隔时间大于2分钟输出时分秒
    if (nowTime - preTime >= 120) {
      msg.push({
        type: "time",
        content: wxutil.getDateTime().slice(-8, -3)
      })
    }

    let content = {
      type: 'message',
    }
    content = {...content, ...res}
    msg.push(content)
    this.setData({
      msg: msg,
      preTime: nowTime
    })
    this.scrollToBottom()
  },

  /**
   * 进入房间处理
   * @param res
   */
  onEntryRoom(res){
    let msg = this.data.msg
    let preTime = this.data.preTime
    let nowTime = Date.parse(new Date())/1000;
    // 间隔时间大于2分钟输出时分秒
    if (nowTime - preTime >= 120) {
      msg.push({
        type: "time",
        content: wxutil.getDateTime().slice(-8, -3)
      })
    }

    let content = {
      type: 'entryRoom',
    }
    content = {...content, ...res}
    msg.push(content)
    this.setData({
      msg: msg
    })
    this.scrollToBottom()
  },
  closeWebSocket(){ // 手动关闭webSocket
    webSocket.close({
      success(){
        webSocket = null;
        console.log('webSocket关闭成功')
      }
    })
  },
  readConnectWebSocket(){  // 重新连接webSocket
    clearTimeout(setTimer); // 先关闭定时器
    if( num <= 5 ){
      num += 1; // 每次重连一次num递增1
      num <= 3? t = num*5:t = t*2;   // t的值每次为 5 10 15 30 60
      setTimer = setTimeout(function name(params) {
        that.connetWebsocket()
      },t*1000)
    }else{ //5次链接都失败走这里
      that.startLogTimer() // startLogTimer为一个开启setInterval的函数
    }
  },
  onShow(){
    this.setData({ automaticClose:true,num:0,t:5 }) // 恢复小程序websocket默认自动断开 初始化数据
    this.connetWebsocket()
  },
  onHide(){
    this.setData({ automaticClose:false  }) // 这一步其实是告诉小程序 这是用户手动断开websocket的, 这一步也判断是否需要重连webSocket的条件依据
    this.closeWebSocket()
  },
  onLoad(options) {
    // const roomId = !options.roomId ? 1 : options.roomId
    // const countDown = options.countDown ? options.countDown : 0
    //
    // // this.getCountDown(countDown)
    // this.getUserId()
    // this.getScrollHeight()
    // this.connectSocket(roomId)
    // this.onSocketMessage("status") // 监听状态信息
    // this.onSocketMessage("message") // 监听文字消息
    // this.onSocketMessage("images") // 监听图片消息
  },
  onSend(){
    const content = this.data.content
    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: "error",
        content: "内容不能为空！"
      })
      return
    }
    wx.sendSocketMessage({
      data:JSON.stringify({
        action: 'speak',
        content: content,
        token: app.globalData.userDetail.token
      })
    })
    this.setData({
      content: null,
    })
  },
  onUnload() {
    //离开页面
    // wx.closeSocket();
    this.setData({ automaticClose:false  }) // 这一步其实是告诉小程序 这是用户手动断开websocket的, 这一步也判断是否需要重连webSocket的条件依据
    this.closeWebSocket()
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
          height: height - 88
        })
      }
    })
  },

  /**
   * 获取倒计时
   */
  getCountDown(countDown) {
    const interval = setInterval(() => {
      let timeDown = this.data.timeDown
      this.setData({
        countDown: --countDown,
        timeDown: ++timeDown
      })
      if (countDown == 300) {
        wx.lin.showMessage({
          content: "树洞将在5分钟后关闭！",
          duration: 3000
        })
      }
      if (countDown <= 60 && countDown > 3) {
        wx.lin.showMessage({
          content: "距离树洞关闭还剩 " + countDown + " 秒！",
          duration: 1000
        })
      }
      if (countDown == 3) {
        wx.lin.showMessage({
          type: "warning",
          content: "树洞即将关闭！",
          duration: 3000
        })
      }
      if (countDown <= 0) {
        clearInterval(interval)
        wx.navigateBack()
      }
    }, 1000);
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    if(!app.globalData.userDetail){
      wx.showModal({
        title: "提示",
        content: "您还未登录，是否跳转到登录页？",
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/auth/index",
            })
          }else{
            let pages = getCurrentPages();
            console.log(pages)
            console.log(111)
            let prevPage = pages[pages.length - 2];
            let lastPage;
            console.log(prevPage);

            if(prevPage === undefined){
              lastPage = '/pages/wa/index'
            }else{
              lastPage = prevPage.route
            }
            console.log(lastPage)
            if(lastPage === '/pages/wa/index' || lastPage === 'pages/profile/index'){
              wx.switchTab({
                url: lastPage,
              })
            }else{
              wx.navigateTo({
                url: lastPage,
              })
            }
          }
        },
        fail: (res) => {
          let pages = getCurrentPages();
          console.log(pages)
          console.log(111)
          let prevPage = pages[pages.length - 2];
          let lastPage;
          console.log(prevPage);
          if(prevPage === undefined){
            lastPage = '/pages/wa/index'
          }else{
            lastPage = prevPage.route
          }
          if(lastPage === '/pages/wa/index' || lastPage === 'pages/profile/index'){
            wx.switchTab({
              url: lastPage,
            })
          }else{
            wx.navigateTo({
              url: lastPage,
            })
          }
        },
      })
    }else{
      this.setData({
        userId: app.globalData.userDetail.id
      })
    }

  },

  /**
   * 连接Socket
   */
  connectSocket(roomId) {
    socket = this.socket = io(api.chatAPI)
    socket.on("connect", () => {
      const data = {
        room_id: roomId,
        token: app.globalData.userDetail.token
      }
      this.sendSocketMessage("join", data)
    })
  },

  /**
   * 发送Socket信息
   */
  sendSocketMessage(path, msg = null) {
    console.log(msg);
    // this.socket.emit(path, msg)
    this.socket.send()
  },

  /**
   * 监听Socket信息
   */
  onSocketMessage(path) {
    this.socket.on(path, (res) => {
      console.log(res)
      let msg = this.data.msg
      let timeDown = this.data.timeDown

      // 间隔时间大于5分钟输出时分秒
      if (timeDown >= 300) {
        msg.push({
          type: "time",
          content: wxutil.getDateTime().slice(-8, -3)
        })
      }

      msg.push(res)
      this.setData({
        msg: msg,
        timeDown: 0
      })
      this.scrollToBottom()
    })
  },

  /**
   * 滚动至底部
   */
  scrollToBottom() {
    const height = wx.getSystemInfoSync().windowHeight
    const query = wx.createSelectorQuery();
    query.select(".msg-scroll").boundingClientRect();
    query.select(".msg-list").boundingClientRect();
    query.exec((res) => {
      const scorllHeight = res[0].height;
      const listHeight = res[1].height;
      if(height < listHeight - scorllHeight + 20){
        this.setData({
          scrollTop: listHeight - scorllHeight
        });
      }
    });
  },

  /**
   * 设置消息内容
   */
  setMessage(event) {
    this.setData({
      content: event.detail.value
    })
  },

  /**
   * 发送消息
   */
  onSendMessageTap() {
    const content = this.data.content
    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: "error",
        content: "内容不能为空！"
      })
      return
    }
    this.sendSocketMessage("send", content)
    this.setData({
      content: null,
    })
  },

  /**
   * 发送图片
   */
  sendImg(event) {
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg == "chooseImage:ok") {
        const url = api.holeAPI + "images/"

        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: res.tempFilePaths[0]
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            this.sendSocketMessage("images", data.data.url)
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "图片上传失败！"
            })
          }
        })
      }
    })
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    const src = event.currentTarget.dataset.src
    const urls = [src]

    wx.previewImage({
      current: "",
      urls: urls
    })
  },

  onShareAppMessage() {
    return {
      title: "艾泽拉斯 聊天室",
      path: "/pages/chat-room/index"
    }
  }
})
