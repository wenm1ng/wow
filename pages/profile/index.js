// pages/profile/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    user: {},
    topics: [],
    comments: [],
    wa_list: [],
    pageTopic: 1,
    pageComment: 1,
    pageStar: 1,
    tabIndex: 0,
    tabsTop: 255,
    isAuth: false,
    tabsFixed: false, // Tabs是否吸顶
    isEndTopic: false, // 话题是否到底
    isEndStar: false, // 收藏是否到底
    isEndComment: false, // 评论是否到底
    loading: false,
    messageBrief: null,
    inRequest: false,
    userId: 0
  },

  onLoad() {
    this.getTabsTop()
    //获取wa收藏信息
    // this.getWaFavoritesList(this.data.pageStar)
    // 轮询获取消息概要
    // setInterval(this.getMessageBrief(), 5000)
  },

  /**
   * 获取收藏wa列表
   */
  getWaFavoritesList(page = 1){
    if (!app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
    this.setData({
      userId: app.globalData.userDetail.id
    })
    const data = {}
    const url = api.waAPI+'get-wa-favorites-list?page='+ page + '&pageSize='+ pageSize;


    if ((this.data.isEndStar && page !== 1) || this.data.inRequest) {
      return
    }

    this.setData({
      inRequest: true
    })

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const wa_list = res.data.data['list']
        this.setData({
          page: (wa_list.length === 0 && page !== 1) ? page - 1 : page,
          loading: false,
          inRequest: false,
          isEndStar: ((wa_list.length < pageSize) || (wa_list.length === 0 && page !== 1)),
          wa_list: page === 1 ? wa_list : this.data.wa_list.concat(wa_list)
        })
      }
    })
  },

  /**
   * 获取用户评论
   */
  getComments(page = 1) {
    if (!app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }

    const url = api.waAPI + 'get-comment-all'
    const pageComment = page
    let data = {
      pageSize: pageSize,
      page: page
    }

    if (this.data.isEndComment && pageComment !== 1 || this.data.inRequest) {
      return
    }

    this.setData({
      inRequest: true
    })

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const comments = res.data.data
        this.setData({
          pageComment: (comments.length === 0 && pageComment !== 1) ? pageComment - 1 : pageComment,
          loading: false,
          isEndComment: ((comments.length < pageSize) || (comments.length === 0 && pageComment !== 1)),
          comments: pageComment === 1 ? comments : this.data.comments.concat(comments)
        })
      }
    })
  },

  onShow() {
      this.getUser()
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
      if (tabIndex === 1) {
        this.getComments()
      }
      if (tabIndex === 0) {
        this.getWaFavoritesList()
      }
  },

  /**
   * 获取用户话题
   */
  getTopics(userId, pageTopic = 1, size = pageSize) {
    const url = api.topicAPI + "user/" + userId + "/"
    let data = {
      size: size,
      page: pageTopic
    }

    if (this.data.isEndTopic && pageTopic != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const topics = res.data.data
        this.setData({
          pageTopic: (topics.length == 0 && pageTopic != 1) ? pageTopic - 1 : pageTopic,
          loading: false,
          isEndTopic: ((topics.length < pageSize) || (topics.length == 0 && pageTopic != 1)) ? true : false,
          topics: pageTopic == 1 ? topics : this.data.topics.concat(topics)
        })
      }
    })
  },

  /**
   * 获取消息概要
   */
  getMessageBrief() {
    const url = api.messageAPI + "brief/"

    if (app.globalData.userDetail) {
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

    if (tabIndex === 0) {
      this.getWaFavoritesList(this.data.pageStar);
    }
    if (tabIndex === 1) {
      this.getComments(this.data.pageComment)
    }
  },

  /**
   * 跳转到授权页面
   */
  gotoAuth() {
    wx.navigateTo({
      url: "/pages/auth/index"
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
            let userDetail = app.globalData.userDetail
            userDetail = Object.assign(userDetail, user)
            wxutil.setStorage("userDetail", userDetail)
            app.globalData.userDetail = userDetail

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
  onReachBottom() {
    const tabIndex = this.data.tabIndex

    this.setData({
      loading: true
    })
    if (tabIndex === 1) {
      const page = this.data.pageComment
      this.getComments(page + 1)
    }
    if (tabIndex === 0) {
      const page = this.data.pageStar
      this.getWaFavoritesList(page + 1)
    }
  },

  /**
   * 删除话题
   */
  deleteTopic(event) {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = event.currentTarget.dataset.id
          const url = api.topicAPI + topicId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              this.getTopics(this.data.user.id)

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
          const url = api.commentAPI + commentId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              this.getComments(this.data.user.id)

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
          const url = api.userAPI + 'favorites/cancel'

          const data = {
            link_id: waId,
            type: 1
          }

          wxutil.request.post(url, data).then((res) => {
            if (res.data.code === 200) {
              this.getWaFavoritesList()

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
    if (event.scrollTop >= this.data.tabsTop) {
      this.setData({
        tabsFixed: true
      })
    } else {
      this.setData({
        tabsFixed: false
      })
    }
  },

  onShareAppMessage() {
    return {
      title: "个人中心",
      path: "/pages/profile/index"
    }
  }
})
