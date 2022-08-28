// pages/help-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 5 // 每页显示条数

Page({
  data: {
    id:0,
    height: 1206, // 话题区高度
    isEnd: false, // 是否到底
    inRequest: false, // 在请求中
    loading: true, // 是否正在加载
    info:{},
    answer_list: [],
    page: 1,
    userId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id: options.id
    })
    this.getUserId();
  },

  /**
   * 获取帮助详情
   */
  getHelpInfo(){
    const data = {
      id: this.data.id
    }
    const url = api.helpCenterAPI + 'info'
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const info = res.data.data
        this.setData({
          info: info
        })
      }
    })
  },
  /**
   * 获取帮助列表
   */
  getAnswerList(){
    const page = this.data.page

    const url = api.helpCenterAPI+'answer-list';
    const data = {
      id: this.data.id,
      page: page,
      pageSize: pageSize
    }

    if ((this.data.isEnd && page !== 1) || this.data.inRequest) {
      return
    }

    // if(isSearch === 1){
    //   wx.showToast({
    //     title: "加载中...",
    //     icon: "loading"
    //   })
    // }

    this.setData({
      inRequest: true
    })

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const answer_list = res.data.data['list']
        this.setData({
          page: (answer_list.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          inRequest: false,
          isEnd: ((answer_list.length < pageSize) || (answer_list.length == 0 && page != 1)) ? true : false,
          answer_list: page === 1 ? answer_list : this.data.answer_list.concat(answer_list)
        })
      }
    })
  },
  /**
   * 并发请求接口
   */
  getApiData(){

//存储promise对象的数组
    let promiseArr = [];
//将图片地址的上传的promise对象加入到promiseArr
    let promise = new Promise((resolve, reject) => {
      //这里可以写要发的请求，这里以上传为例
      this.getHelpInfo();
    });
    promiseArr.push(promise)
    let promiseAnswer = new Promise((resolve, reject) => {
      //这里可以写要发的请求，这里以上传为例
      this.getAnswerList();
    });
    promiseArr.push(promiseAnswer)
//Promise.all处理promiseArr数组中的每一个promise对象
    Promise.all(promiseArr).then((result) => {
      //在存储对象的数组里的所有请求都完成时，会执行这里
      console.log(11111);
    })
  },
  buttonClick(e) {
    let type = e.target.dataset.type;
    type = 'searchQuery.'+ type;
    let value = e.target.dataset.value;
    this.setData({
      [type]: value
    })
    console.log(this.data.searchQuery);
  },
  /**
   * 跳转到回答页面
   */
  gotoAddAnswer(){
    if(!app.globalData.userDetail){
      wx.navigateTo({
        url: "/pages/auth/index"
      })
      return;
    }
    wx.navigateTo({
      url: "/pages/answer-add/index?helpId=" + this.data.id + '&helpType=' + this.data.info.help_type
    })
  },
  /**
   * 进行搜索
   */
  submit() {
    this.getHelpList(1)
    this.hideLeft();
  },
  /**
   * 重置搜索条件
   */
  reset() {
    this.setData({
      ['searchQuery.version']: 0,
      ['searchQuery.help_type']: 0,
      ['searchQuery.is_pay']: 0,
      ['searchQuery.adopt_type']: 0,
    })
  },
  /**
   * 阻止冒泡事件
   */
  closeBubble(){
    //不做任务处理
  },
  getHelpList(isSearch = 0){
    const page = isSearch === 1 ? 1 : this.data.page

    const url = api.helpCenterAPI+'list';
    const data = {
      version: this.data.searchQuery.version,
      help_type: this.data.searchQuery.help_type,
      is_pay: this.data.searchQuery.is_pay,
      adopt_type: this.data.searchQuery.adopt_type,
      order: this.data.orderColumn,
      page: page,
      pageSize: pageSize
    }

    if ((this.data.isEnd && page !== 1 && isSearch === 0) || this.data.inRequest) {
      return
    }

    // if(isSearch === 1){
    //   wx.showToast({
    //     title: "加载中...",
    //     icon: "loading"
    //   })
    // }

    this.setData({
      inRequest: true
    })

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        const help_list = res.data.data['list']
        this.setData({
          page: isSearch === 1 ? 1 :((help_list.length == 0 && page != 1) ? page - 1 : page),
          loading: false,
          inRequest: false,
          isEnd: isSearch === 1 ? false : (((help_list.length < pageSize) || (help_list.length == 0 && page != 1)) ? true : false),
          help_list: isSearch === 1 ? help_list : (page === 1 ? help_list : this.data.help_list.concat(help_list))
        })
      }
      if(isSearch === 1) {
        // wx.pageScrollTo({
        //   scrollTop: 0
        // })
        this.setData({
          scrollTop: 0
        })
        //   wx.hideToast()
      }
    })
  },
  // /**
  //  * 生命周期函数--监听页面加载
  //  */
  //  onLoad: function (options) {
  //   this.getTalentList(options.version, options.oc)
  //   this.getTalentTreeList(options.version)
  // },
  onShow() {
    // this.getHelpList()
    this.getScrollHeight()
    this.getApiData();
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
        console.log(height);
        that.setData({
          height: height - 150
        })
      }
    })
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    if (app.globalData.userDetail) {
      this.setData({
        userId: app.globalData.userDetail.id
      })
    }
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    const index = event.currentTarget.dataset.index
    const current = event.currentTarget.dataset.src

    const urls = [];
    var val = this.data.help_list[index].image_url
    urls.push(val)

    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  /**
   * 下拉刷新
   */
  // scrollToUpper() {
  //   this.getHelpList()
  //   // 振动交互
  //   wx.vibrateShort()
  // },

  /**
   * 触底加载
   */
  scrollToLower() {
    const page = this.data.page
    console.log('wenming')
    this.setData({
      loading: true,
      page:page + 1
    })

    this.getHelpList()
  },

  /**
   * 标签切换
   */
  onTagTap(event) {
    const currLabelId = event.currentTarget.dataset.label
    if(currLabelId === this.data.talentName || currLabelId === this.data.searchValue){
      return;
    }
    this.setData({
      talentName: currLabelId,
      labelId: currLabelId
    })
    this.getHelpList(1)
  },

  onOrder(event){
    const orderColumn = event.currentTarget.dataset.order
    if(orderColumn === this.data.orderColumn){
      return;
    }
    this.setData({
      orderColumn: orderColumn
    })

    this.getHelpList(1)

  },

  /**
   * 点击显示或隐藏全文
   */
  onFlodTap(event) {
    const index = event.target.dataset.index
    let help_list = this.data.help_list

    if (help_list[index].flod) {
      help_list[index].flod = false
    } else {
      help_list[index].flod = true
    }
    this.setData({
      help_list: help_list
    })
  },

  /**
   * 展开操作菜单
   */
  onMoreTap(event) {
    const topicIndex = event.currentTarget.dataset.index
    let actionList = [{
      name: "分享",
      color: "#666",
      openType: "share"
    }, {
      name: "举报",
      color: "#666"
    }]

    if (this.data.userId == this.data.topics[topicIndex].user.id) {
      actionList.push({
        name: "删除",
        color: "#d81e05"
      })
    }

    this.setData({
      actionList: actionList,
      showAction: true,
      topicIndex: topicIndex
    })
  },

  /**
   * 关闭操作菜单
   */
  onCancelSheetTap(e) {
    this.setData({
      showAction: false
    })
  },

  /**
   * 点击操作菜单按钮
   */
  onActionItemtap(event) {
    const index = event.detail.index

    if (index == 1) {
      // 举报话题
      this.reportTopic()
    }
    if (index == 2) {
      // 删除话题
      this.deleteTopic()
    }
  },

  /**
   * 删除话题
   */
  deleteTopic() {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = this.data.topics[this.data.topicIndex].id
          const url = api.topicAPI + topicId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              this.getTopics(this.data.page, this.data.labelId)

              wx.lin.showMessage({
                type: "success",
                content: "删除成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "删除失败！"
              })
            }
          })
        }
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

  /**
   * 点击编辑
   */
  onEditTap() {
    console.log(app.globalData.userDetail)
    if (app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/topic-edit/index"
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  /**
   * 点赞或取消点赞
   */
  onStarTap(event) {
    if (app.globalData.userDetail) {
      let id = this.data.id
      let info = this.data.info
      const url = api.userAPI + 'likes'
      const data = {
        link_id: id,
        type:3
      }

      wxutil.request.post(url, data).then((res) => {
        if (res.data.code == 200) {
          const hasLikes = info.has_favor
          info.has_favor = !info.has_favor

          if (hasLikes) {
            info.favorites_num--
          } else {
            info.favorites_num++
          }

          this.setData({
            info: info
          })
        }
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    if (app.globalData.userDetail) {
      this.setData({
        userId: app.globalData.userDetail.id
      })
    }
  },

  /**
   * 点赞或取消点赞（回答）
   */
  onStarTapAnswer(event) {
    if (app.globalData.userDetail) {
      const index = event.currentTarget.dataset.index
      let answer_list = this.data.answer_list

      const url = api.userAPI + 'likes'
      const data = {
        link_id: answer_list[index].id,
        type:4
      }

      wxutil.request.post(url, data).then((res) => {
        if (res.data.code == 200) {
          const hasLikes = answer_list[index].has_favor
          answer_list[index].has_favor = !answer_list[index].has_favor

          if (hasLikes) {
            answer_list[index].favorites_num--
          } else {
            answer_list[index].favorites_num++
          }

          this.setData({
            answer_list: answer_list
          })
        }
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },
  /**
   * 跳转话题详情页
   */
  gotoDetail(event) {
    const answerId = event.currentTarget.dataset.id
    const index = event.currentTarget.dataset.index
    wx.navigateTo({
      url: "/pages/answer-detail/index?id=" + answerId + '&index='+ index
    })
  },

  /**
   * 点击评论跳转话题详情页
   */
  onCommentTap(event) {
    const topicId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/topic-detail/index?focus=true&topicId=" + topicId
    })
  },

  /**
   * 跳转到用户名片页
   */
  gotoVisitingCard(event) {
    if (app.globalData.userDetail) {
      const userId = event.target.dataset.userId
      wx.navigateTo({
        url: "/pages/visiting-card/index?userId=" + userId
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  onShareAppMessage(res) {
    if (res.from == "button") {
      const topicIndex = this.data.topicIndex
      const topics = this.data.topics
      return {
        title: topics[topicIndex].content,
        imageUrl: topics[topicIndex].images ? topics[topicIndex].images[0] : '',
        path: "/pages/topic-detail/index?topicId=" + topics[topicIndex].id
      }
    }
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})
