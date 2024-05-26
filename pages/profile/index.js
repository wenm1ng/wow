// pages/profile/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 10 // 每页显示条数
const pageSizeComment = 7 //评论列表每页条数
Page({
  data: {
    user: {},
    showNickNames: false,
    nicknameLoading: false,
    nickName: '',
    nicknameForm:{
      nickName:'',
      // noEmptyRule:{
      //   required: true,
      //   message:'请填写昵称',
      //   trigger: 'blur'
      // },
    },
    topics: [],
    comments: [],
    wa_list: [],
    help_list:[],
    answer_list:[],
    pageTopic: 1,
    pageComment: 1,
    pageStar: 1,
    pageHelp: 1,
    pageAnswer: 1,
    tabIndex: 0,
    tabsTop: 255,
    scrollTop: 0,
    isAuth: false,
    tabsFixed: false, // Tabs是否吸顶
    isEndTopic: false, // 话题是否到底
    isEndStar: false, // 收藏是否到底
    isEndComment: false, // 评论是否到底
    isEndHelp: false, // 帮助是否到底
    isEndAnswer: false, // 回答是否到底
    loading: false,
    messageBrief: null,
    inRequest: false,
    userId: 0,
    heightComment: 800,
    heightFavorites: 800,
    heightHelp: 800,
    heightAnswer: 800,
    commentNum: 0,
    favoritesNum: 0,
    helpNum: 0,
    answerNum: 0,
    noRead:'' //未读消息
  },

  onLoad() {
    this.getScrollHeight()
    this.getTabsTop()
    // this.checkAuth()
    //获取wa收藏信息
    // this.getWaFavoritesList(this.data.pageStar)
    // 轮询获取消息概要
    // setInterval(this.getMessageBrief(), 5000)
  },
  /**
   * 设置用户信息
   */
  setUser(){
    if (app.getUserDetailNew()){
      this.setData({
        user: app.getUserDetailNew()
      })
    }
  },
  /**
   * 获取用户收藏、评论数
   */
  getNum(){
    if(!this.checkAuth()){
      return;
    }
    const url = api.userAPI + 'get-num';
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          commentNum: res.data.data.comment_num,
          favoritesNum: res.data.data.favorites_num,
          helpNum: res.data.data.help_num,
          answerNum: res.data.data.answer_num
        })
      }
    })
  },

  /**
   * 验证是否登录
   */
  checkAuth(){
    if (!app.getUserDetailNew()) {
      return false
    }
    return true
  },

  /**
   * 获取帮助列表
   * @param page
   */
  getHelpList(page = 1){
    if(!this.checkAuth()){
      return;
    }
    const data = {
      page: page,
      pageSize: pageSize
    }
    const url = api.helpCenterAPI+'user-list?page='+ page + '&pageSize='+ pageSize;


    if ((this.data.isEndHelp && page !== 1) || this.data.inRequest) {
      return
    }
    this.setData({
      inRequest: true,
    })
    wx.showLoading({
      title: '加载中',
    });
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const help_list = res.data.data['list']
        this.setData({
          pageHelp: (help_list.length === 0 && page !== 1) ? page - 1 : page,
          isEndHelp: ((help_list.length < pageSize) || (help_list.length === 0 && page !== 1)),
          help_list: page === 1 ? help_list : this.data.help_list.concat(help_list),
        })
      }
      this.setData({
        loading: false,
        inRequest: false,
      })
      wx.hideLoading()

    })
  },

  /**
   * 获取回答列表
   * @param page
   */
  getAnswerList(page = 1){
    if(!this.checkAuth()){
      return;
    }
    const data = {
      page: page,
      pageSize: pageSize
    }
    const url = api.helpCenterAPI+'user-answer-list?page='+ page + '&pageSize='+ pageSize;


    if ((this.data.isEndAnswer && page !== 1) || this.data.inRequest) {
      return
    }
    this.setData({
      inRequest: true,
    })
    wx.showLoading({
      title: '加载中',
    });
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const answer_list = res.data.data['list']
        this.setData({
          pageAnswer: (answer_list.length === 0 && page !== 1) ? page - 1 : page,
          isEndAnswer: ((answer_list.length < pageSize) || (answer_list.length === 0 && page !== 1)),
          answer_list: page === 1 ? answer_list : this.data.answer_list.concat(answer_list),
        })
      }
      this.setData({
        loading: false,
        inRequest: false,
      })
      wx.hideLoading()

    })
  },
  /**
   * 获取收藏wa列表
   */
  getWaFavoritesList(page = 1){
    if(!this.checkAuth()){
      return;
    }
    const data = {
      page: page,
      pageSize: pageSize
    }
    const url = api.waAPI+'get-wa-favorites-list?page='+ page + '&pageSize='+ pageSize;


    if ((this.data.isEndStar && page !== 1) || this.data.inRequest) {
      console.log(222);
      return
    }
    this.setData({
      inRequest: true,
    })
    wx.showLoading({
      title: '加载中',
    });
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const wa_list = res.data.data['list']
        this.setData({
          pageStar: (wa_list.length === 0 && page !== 1) ? page - 1 : page,
          isEndStar: ((wa_list.length < pageSize) || (wa_list.length === 0 && page !== 1)),
          wa_list: page === 1 ? wa_list : this.data.wa_list.concat(wa_list),
        })
        console.log(this.data.wa_list);
      }
      this.setData({
        loading: false,
        inRequest: false,
      })
      wx.hideLoading()

    })
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
          heightComment: height - 700,
          heightFavorites: height - 700,
          heightHelp: height - 700,
          heightAnswer: height - 700,
        })
      }
    })
  },

  /**
   * 获取用户评论
   */
  getComments(page = 1) {
    if(!this.checkAuth()){
      return;
    }
    const url = api.waAPI + 'get-comment-all'
    const pageComment = page
    let data = {
      pageSize: pageSizeComment,
      page: page
    }

    if ((this.data.isEndComment && pageComment !== 1) || this.data.inRequest) {
      return
    }

    this.setData({
      inRequest: true,
      pageStar: pageComment
    })
    wx.showLoading({
      title: '加载中',
    });
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const comments = res.data.data.list
        //判断是否有加页数
        this.setData({
          pageComment: (comments.length === 0 && pageComment !== 1) ? pageComment - 1 : pageComment,
          isEndComment: ((comments.length < pageSizeComment) || (comments.length === 0 && pageComment !== 1)),
          comments: pageComment === 1 ? comments : this.data.comments.concat(comments),
        })
        if(res.data.data.reduce_read_num !== ''){
          if(app.globalData.noRead - res.data.data.reduce_read_num <= 0){
            app.globalData.noRead = ''
            this.setData({
              noRead: ''
            })
          }else{
            app.globalData.noRead = (parseInt(app.globalData.noRead) - res.data.data.reduce_read_num).toString()
            this.setData({
              noRead: '(' + app.globalData.noRead + '未读)'
            })
          }
          if(this.data.noRead === ''){
            wx.removeTabBarBadge({
              index: 2,
            })
          }else{
            wx.setTabBarBadge({
              index: 2,
              text: app.globalData.noRead
            })
          }
        }
      }
      this.setData({
        loading: false,
        inRequest: false,
      })

      wx.hideLoading()
    })
  },

  onShow() {
    this.setUser()
    this.getNum()
    this.getUser()
    if(app.globalData.noRead !== '' && app.globalData.noRead !== undefined){
      this.setData({
        noRead: '(' + app.globalData.noRead + '未读)'
      })
    }
  },

  /**
   * 获取Tabs的高度
   */
  getTabsTop() {
    const navigateHeight = 56
    const query = wx.createSelectorQuery();
    query.select("#tabs").boundingClientRect((res) => {
      this.setData({
        tabsTop: res.top - navigateHeight
      })
    }).exec();
  },

  /**
   * 获取用户信息
   */
  getUser() {
      const tabIndex = this.data.tabIndex
      switch(tabIndex){
        case 0:
          this.getWaFavoritesList()
          break;
        case 1:
          this.getComments()
          break;
        case 2:
          this.getHelpList()
          break;
        case 3:
          this.getAnswerList()
          break;
      }
  },

  /**
   * 获取消息概要
   */
  getMessageBrief() {
    const url = api.messageAPI + "brief/"

    if (app.getUserDetailNew()) {
      wxutil.request.get(url).then((res) => {
        if (res.data.code == 200) {
          if (res.data.data.count > 0) {
            this.setData({
              messageBrief: res.data.data
            })
            wx.setTabBarBadge({
              index: 2,
              text: res.data.data.count + ""
            })
          } else {
            this.setData({
              messageBrief: null
            })
            wx.removeTabBarBadge({
              index: 2,
              fail(error) { }
            })
          }
        }
      })
    }
    return this.getMessageBrief
  },

  /**
   * Tab切换
   */
  changeTabs(event) {
    const tabIndex = event.detail.currentIndex
    this.setData({
      tabIndex: tabIndex
    })
    if (tabIndex === 0 && this.data.wa_list.length === 0) {
      this.getWaFavoritesList(this.data.pageStar);
    }
    if (tabIndex === 1 && this.data.comments.length === 0) {
      this.getComments(this.data.pageComment)
    }
    if (tabIndex === 2 && this.data.help_list.length === 0) {
      this.getHelpList(this.data.pageHelp)
    }
    if (tabIndex === 3 && this.data.answer_list.length === 0) {
      this.getAnswerList(this.data.pageAnswer)
    }
  },

  /**
   * 跳转到授权页面
   */
  gotoAuth() {
    if(app.getUserDetailNew()){
      return;
    }
    wx.navigateTo({
      url: "/pages/auth/index"
    })
  },

  //上传头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log(avatarUrl)

    const url = api.userAPI + "save_head_image"
    let that = this
    return new Promise(function (resolve, reject) {
      wxutil.file.upload({
        url: url,
        fileKey: "file",
        filePath: avatarUrl,
      }).then((res) => {
        const data = JSON.parse(res.data);
        let userDetail = wxutil.getStorage("userDetail")
        if (data.code === 200) {
          userDetail.avatarUrl = data.data.avatarUrl
          userDetail.is_save_avatar = 1
          wxutil.setStorage('userDetail', userDetail, wxutil.getStorageTime('userDetail'))
          that.setData({
            'user.avatarUrl': avatarUrl,
            'user.is_save_avatar': 1
          })
          wx.lin.showMessage({
            type: "success",
            content: "保存成功！"
          })
        }else{
          wx.lin.showMessage({
            type: "error",
            content: "保存失败！"
          })
        }
      }).catch((error) => {
        reject(error)
      })
    })
  },

  /**
   * 跳转到编辑资料页面
   */
  gotoUserEdit() {
    wx.navigateTo({
      url: "/pages/user-edit/index"
    })
  },

  /**
   * 跳转到关注我的页面
   */
  gotoFollower() {
    wx.navigateTo({
      url: "/pages/follower/index?userId=" + this.data.user.id
    })
  },

  /**
   * 跳转到我关注的页面
   */
  gotoFollowing() {
    wx.navigateTo({
      url: "/pages/following/index?userId=" + this.data.user.id
    })
  },

  /**
   * 跳转话题详情页
   */
  gotoWaDetail(event) {
    const waId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/wa-detail/index?id=" + waId
    })
  },

  /**
   * 跳转求助详情页
   * @param event
   */
  gotoHelpDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/help-detail/index?id=" + id
    })
  },

  /**
   * 跳转帮助详情页
   * @param event
   */
  gotoAnswerDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/answer-detail/index?id=" + id
    })
  },
  /**
   * 跳转消息页
   */
  gotoMessage() {
    wx.navigateTo({
      url: "/pages/message/index"
    })
  },

  /**
   * 跳转到用户名片页
   */
  gotoVisitingCard(event) {
    console.log(event)
    if (app.getUserDetailNew()) {
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

  /**
   * 修改封面
   */
  changePoster() {
    wx.lin.showMessage({
      content: "设置封面图片"
    })

    // 上传封面
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg == "chooseImage:ok") {
        wxutil.showLoading("上传中...")
        const url = api.userAPI + "poster/"

        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: res.tempFilePaths[0]
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            wx.hideLoading()
            // 更新缓存
            const user = data.data
            let userDetail = app.getUserDetailNew()
            userDetail = Object.assign(userDetail, user)
            wxutil.setStorage("userDetail", userDetail)

            this.setData({
              user: user
            })

            wx.lin.showMessage({
              type: "success",
              content: "封面修改成功！"
            })
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "封面修改失败！"
            })
          }
        })
      }
    })
  },

  /**
   * 修改头像
   */
  changeAvatar() {
    wx.lin.showMessage({
      content: "设置头像图片"
    })
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg == "chooseImage:ok") {
        wx.navigateTo({
          url: "/pages/images-cropper/index?src=" + res.tempFilePaths[0],
        })
      }
    })
  },

  /**
   * 触底加载
   */
  scrollToLower() {
    const tabIndex = this.data.tabIndex
    console.log('进入底部')
    this.setData({
      loading: true
    })
    if (tabIndex === 0) {
      const page = this.data.pageStar
      this.getWaFavoritesList(page + 1)
    }
    if (tabIndex === 1) {
      const page = this.data.pageComment
      this.getComments(page + 1)
    }
    if (tabIndex === 2 ) {
      const page = this.data.pageHelp
      this.getHelpList(page + 1)
    }
    if (tabIndex === 3) {
      const page = this.data.pageAnswer
      this.getAnswerList(page + 1)
    }
  },

  //钱包页面
  gotoWallet(){
    if(!app.checkUserDetailGoAuth()){
      return;
    }
    wx.navigateTo({
      url: "/pages/wallet-detail/index"
    })
  },

  /**
   * 删除评论
   */
  deleteComment(event) {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该评论？",
      success: (res) => {
        if (res.confirm) {
          const commentId = event.currentTarget.dataset.id
          const index = event.currentTarget.dataset.index
          const url = api.waAPI + 'del-comment'
          const data = {
            'id' : commentId
          }
          const comments = this.data.comments
          wxutil.request.post(url, data).then((res) => {
            if (res.data.code === 200) {
              app.arrRemoveObj(comments, comments[index])
              this.setData({
                comments: comments,
                commentNum: this.data.commentNum - 1
              })
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
   * 删除回答
   */
  deleteAnswer(event){
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该回答？",
      success: (res) => {
        if (res.confirm) {
          const id = event.currentTarget.dataset.id
          const helpId = event.currentTarget.dataset.help_id
          const index = event.currentTarget.dataset.index
          const url = api.helpCenterAPI + 'del-answer'
          const data = {
            'id' : id,
            'help_id': helpId
          }
          const answer_list = this.data.answer_list
          wxutil.request.post(url, data).then((res) => {
            if (res.data.code === 200) {
              app.arrRemoveObj(answer_list, answer_list[index])
              this.setData({
                answer_list: answer_list,
                answerNum: this.data.answerNum - 1
              })
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
   * 取消收藏
   */
  deleteStar(event) {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要取消收藏该wa？",
      success: (res) => {
        if (res.confirm) {
          const waId = event.currentTarget.dataset.id
          const index = event.currentTarget.dataset.index
          const url = api.userAPI + 'favorites/cancel'

          const data = {
            link_id: waId,
            type: 1
          }

          const wa_list  = this.data.wa_list
          wxutil.request.post(url, data).then((res) => {
            if (res.data.code === 200) {
              app.arrRemoveObj(wa_list, wa_list[index])
              this.setData({
                wa_list: wa_list,
                favoritesNum: this.data.favoritesNum - 1
              })

              wx.lin.showMessage({
                type: "success",
                content: "取消成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "取消失败！"
              })
            }
          })
        }
      }
    })
  },

  onPageScroll(event) {
    // console.log(event.scrollTop)
    if (event.scrollTop >= this.data.tabsTop) {
      // this.setData({
      //   tabsFixed: true
      // })
      // this.onReachBottom()
    }
  },

  onShareAppMessage() {
    return {
      title: "个人中心",
      path: "/pages/profile/index"
    }
  },

  showNickName(){
    this.setData({
      showNickNames: true
    })
  },

  onEditNickname(e) {
    if(e.detail.value != this.data.nickName){
      this.setData({
        nickName: e.detail.value
      })
    }
  },
  changeNicknameLoading(bool){
    this.setData({
      nicknameLoading: bool
    })
  },
  //保存昵称
  saveNickName(){
    this.changeNicknameLoading(true)
    if(this.data.nickName.length < 1){
      wx.showToast({
        title: '请填写昵称',
        icon: 'error',
        duration: 2000//持续的时间
      })
      this.changeNicknameLoading(false)
      return;
    }
    let userDetail = wxutil.getStorage("userDetail")
    let url = api.userAPI + 'save_nickname'
    let data = {nickname:this.data.nickName}
    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        userDetail.nickName = this.data.nickName
        userDetail.is_save_nickname = 1
        wxutil.setStorage('userDetail', userDetail, wxutil.getStorageTime('userDetail'))
        this.setData({
          showNickNames: false,
          'user.nickName':this.data.nickName,
          nicknameLoading: false
        })
        wx.lin.showMessage({
          type: "success",
          content: "保存成功！"
        })
      } else {
        this.changeNicknameLoading(false)

        wx.lin.showMessage({
          type: "error",
          content: "保存失败！"
        })
      }
    })
  }
})
