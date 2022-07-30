// pages/help/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 10 // 每页显示条数

Page({
  data: {
    labels: [],
    actionList: [],
    page: 1,
    labelId: '全部',
    userId: -1,
    topicIndex: -1, // 点击的话题的下标
    height: 1206, // 话题区高度
    showPopup: false, // 是否显示下拉区
    showAction: false, // 是否显示操作菜单
    isEnd: false, // 是否到底
    inRequest: false, // 在请求中
    loading: true, // 是否正在加载
    help_list:[],
    orderColumn: 'create_at',
    scrollTop: 0,
    version_list: [],
    searchQuery: {
      version: 0,
      help_type: [],
      is_pay: 0,
      adopt_type: 0,
      order: '',
    },
    pay_num: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      version: options.version ? options.version : 1,
      talentName: options.talentName ? options.talentName : '',
      type:options.type ? options.type : 1,
      ttId:options.ttId ? options.ttId : 0,
      occupation:options.occupation ? options.occupation : '',
      searchValue: options.searchValue ? options.searchValue : '',
    })
    if(wxutil.getStorage('version_list')){
      this.setData({
        version_list: wxutil.getStorage('version_list')
      })
    }
    this.getScrollHeight()
    this.getHelpList()
    // this.getLabels()
    // this.getUserId()
    // this.getTopics()
  },
  showRight() {
    this.setData({
      leftView: !this.data.leftView,
      orderColumn: 'search'
    })
  },
  hideLeft() {
    this.setData({
      leftView: !this.data.leftView,
    })
  },
  buttonClick(e) {
    let type = e.target.dataset.type;
    type = 'searchQuery.'+ type;
    let value = e.target.dataset.value;
    this.setData({
      [type]: value
    })
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  change(e) {
    let items = this.data.items;
    items.forEach(item => {
      if(item.name == e.detail.key) {
        item.checked = e.detail.checked;
      }
    });
    this.setData({
      items: items
    });
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
      order: this.data.searchQuery.order,
      page: page,
      pageSize: pageSize
    }

    if ((this.data.isEnd && page !== 1 && isSearch === 0) || this.data.inRequest) {
      return
    }

    if(isSearch === 1){
      wx.showToast({
        title: "加载中...",
        icon: "loading"
      })
    }

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
        wx.hideToast()
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
    // const labelId = wxutil.getStorage("labelId")
    // // 由于wx.switchTab()的传参限制，故用缓存获取标签参数
    //
    // if (!wxutil.getStorage("refreshTopics")) {
    //   if (labelId) {
    //     wx.removeStorageSync("labelId")
    //     this.setData({
    //       labelId: labelId,
    //       toTag: "tag_" + labelId
    //     })
    //     // this.getTopics(1, labelId)
    //   }
    // } else {
    //   wx.removeStorageSync("refreshTopics")
    //   this.setData({
    //     labelId: -1
    //   })
    //   // this.getTopics()
    // }
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
   * 获取标签
   */
  getLabels() {
    if(this.data.searchValue !== ''){
      return
    }
    const url = api.waAPI + 'get-wa-label'
    const data = {
      version:this.data.version,
      tt_id:this.data.ttId,
      oc:this.data.occupation
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        let labels = ['全部']
        this.setData({
          labels: labels.concat(res.data.data.labels)
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
    for(var key in this.data.help_list[index].images){
      var val = this.data.help_list[index].images[key]['image_url']
      urls.push(val)
    }

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
   * 举报话题
   */
  reportTopic() {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要举报该话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = this.data.topics[this.data.topicIndex].id
          const url = api.topicAPI + "report/"
          const data = {
            topic_id: topicId
          }

          wxutil.request.post(url, data).then((res) => {
            if (res.data.code == 200) {
              wx.lin.showMessage({
                type: "success",
                content: "举报成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "举报失败！"
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
      const index = event.currentTarget.dataset.index
      let help_list = this.data.help_list

      const url = api.userAPI + 'likes'
      const data = {
        link_id: help_list[index].id,
        type:2
      }

      wxutil.request.post(url, data).then((res) => {
        if (res.data.code == 200) {
          const hasLikes = help_list[index].has_likes
          help_list[index].has_likes = !help_list[index].has_likes

          if (hasLikes) {
            help_list[index].likes_count--
          } else {
            help_list[index].likes_count++
          }

          this.setData({
            help_list: help_list
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
    const waId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/wa-detail/index?id=" + waId
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
