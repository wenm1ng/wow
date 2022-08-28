// pages/topic-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 7 // 每页显示条数

Page({
  data: {
    info: {},
    id:0,
    comments: [],
    stars: [],
    placeholder: "评论点什么吧~",
    userId: -1,
    page: 1,
    comment: null,
    commentId: null,
    reply_user_id:null,
    focus: false, // 获取焦点
    showAction: false, // 是否显示操作菜单
    isEnd: false, // 是否到底onStarTap
    isShowWa: false, //是否弹出wa字符串复制
    index: -1,
    isRequest:false //是否正在处理请求
  },

  onLoad(options) {
    const answerId = options.id
    const focus = options.focus

    this.setData({
      index: options.index,
      id: answerId
    })
    // 评论获取焦点展开键盘
    if (focus) {
      this.setData({
        focus: true
      })
    }
    this.getDetail()
    this.getUserId()
  },

  /**
   * 获取动态详情
   */
  getDetail() {
    const url = api.helpCenterAPI + "get-answer-info?id=" + this.data.id

    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        const info = res.data.data
        this.setData({
          info: info
        })
        if ("id" in info) {
          this.getComments()
          // this.getStars(answerId)
          // this.getTemplateId()
        }
      }
    })
  },

  /**
   * 弹出wa字符串复制层
   */
  popWa(){
    this.setData({
      isShowWa:true
    })
  },
  /**
   * 复制wa字符串
   */
  copyWaStr(){
    // wx.setClipboardData({
    //   data: 'data',
    //   success (res) {
    //     wx.getClipboardData({
    //       success (res) {
    //         console.log(res.data) // data
    //       }
    //     })
    //   }
    // })
    wx.setClipboardData({
      data:this.data.info.wa_content,//要复制的数据
      success (res) {
        console.log(res)
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000//持续的时间
        })
      }
    })
  },
  /**
   * 获取评论
   */
  getComments(page = 1) {
    const url = api.waAPI + "get-comment"
    let data = {
      pageSize: pageSize,
      page: page,
      id: this.data.id,
      type: 2
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const comments = res.data.data.list
        this.setData({
          page: (comments.length == 0 && page != 1) ? page - 1 : page,
          isEnd: ((comments.length < pageSize) || (comments.length == 0 && page != 1)) ? true : false,
          comments: page == 1 ? comments : this.data.comments.concat(comments)
        })
        if(res.data.data.reduce_read_num !== ''){
          if(app.globalData.noRead - res.data.data.reduce_read_num <= 0){
            app.globalData.noRead = ''
            wx.removeTabBarBadge({
              index: 2
            })
          }else{
            app.globalData.noRead = (parseInt(app.globalData.noRead) - res.data.data.reduce_read_num).toString()
            wx.setTabBarBadge({
              index: 2,
              text: app.globalData.noRead
            })
          }
        }

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
   * 获取收藏
   */
  getStars(answerId) {
    const url = api.userAPI + 'likes'
    const data = {
      link_id: answerId,
      type:2
    }

    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        const is_favorites = info.is_favorites
        info.is_favorites = !info.is_favorites

        if (is_favorites) {
          info.favor_count--
        } else {
          info.favor_count++
        }

        this.setData({
          info: info
        })
      }
    })
  },

  /**
   * 加载更多评论
   */
  getMoreComments() {
    const page = this.data.page
    this.getComments(page + 1)
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    const current = event.currentTarget.dataset.src

    const urls = [];
    for(var key in this.data.info.images){
      var val = this.data.info.images[key]['image_url']
      urls.push(val)
    }

    wx.previewImage({
      current: current,
      urls: urls
    })
  },


  /**
   * 关闭操作菜单
   */
  onCancelSheetTap() {
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
          const answerId = this.data.topic.id
          const url = api.waAPI + answerId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              wx.lin.showMessage({
                type: "success",
                content: "删除成功！",
                success() {
                  wx.navigateBack()
                }
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
      content: "确定要举报该wa？",
      success: (res) => {
        if (res.confirm) {
          const answerId = this.data.topic.id
          const url = api.waAPI + "report/"
          const data = {
            topic_id: answerId
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
   * 跳转话题页面
   */
  gotoTopic(event) {
    const labelId = event.currentTarget.dataset.label
    wxutil.setStorage("labelId", labelId)
    wx.switchTab({
      url: "/pages/topic/index"
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

  /**
   * 收藏wa
   * @param event
   */
  onFavoritesTap(event){
    if (!app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
    // let isWa = event.currentTarget.dataset.iswa
    let info = this.data.info

    const url = api.userAPI + 'favorites/add';
    const data = {
      link_id: info.id,
      type:1
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code === 200) {
        const is_favorites = info.is_favorites
        info.is_favorites = 1

        if (!is_favorites) {
          info.favor_count++
        }

        this.setData({
          info: info
        })
        wx.showToast({
          title: '已收藏',
          icon: 'success',
          duration: 2000//持续的时间
        })
      }else{
        wx.showToast({
          title: '收藏失败！',
          icon: 'success',
          duration: 2000//持续的时间
        })
      }
    })
  },
  /**
   * 点赞或取消点赞
   */
  onStarTapAnswer(event) {
    if (!app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
    if(this.data.isRequest){
      return;
    }
    this.setData({
      isRequest: true
    })
    let info = this.data.info

    const url = api.userAPI + 'likes';
    const data = {
      link_id: info.id,
      type:4
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        let that = this
        const has_favor = info.has_favor
        info.has_favor = !info.has_favor

        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        let answer_list = prevPage.data.answer_list;
        console.log(that.data.index)
        console.log(answer_list)
        if (has_favor) {
          info.favorites_num--
          answer_list[that.data.index]['favorites_num'] = answer_list[that.data.index]['favorites_num'] - 1
        } else {
          info.favorites_num++
          answer_list[that.data.index]['favorites_num'] = answer_list[that.data.index]['favorites_num'] + 1
        }

        answer_list[that.data.index]['has_favor'] = info.favorites_num === 0 ? 0 : 1
        this.setData({
          info: info,
          isRequest: false
        })

        prevPage.setData({
          answer_list: answer_list
        });
      }
    })
  },

  /**
   * 设置评论
   */
  inputComment(event) {
    this.setData({
      comment: event.detail.value
    })
  },


  //点击回复input获取焦点
  onClickReply(e){
    setTimeout(function(){
      this.data.focus = true;
    },500)
  },

  /**
   * 点击评论列表
   */
  onCommentItemTap(event) {
    const index = event.currentTarget.dataset.index
    this.setData({
      focus: true,
      commentId: this.data.comments[index].id,
      placeholder: "@" + this.data.comments[index].user_name,
      reply_user_id:this.data.comments[index].user_id,
    })
  },

  /**
   * 点击评论图标
   */
  onCommentTap(event) {
    this.setData({
      focus: true,
      commentId: null,
      placeholder: "评论点什么吧..."
    })
  },

  /**
   * 发送评论
   */
  onCommntBtnTap() {
    if (!app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }

    const comment = this.data.comment
    if (!wxutil.isNotNull(comment)) {
      wx.lin.showMessage({
        type: "error",
        content: "评论不能为空！"
      })
      return
    }

    const that = this

    wx.requestSubscribeMessage({
      complete() {
        // 发送评论
        const url = api.waAPI + 'to-comment'
        let info = that.data.info
        const answerId = info.id
        let data = {
          content: comment,
          wa_id: answerId,
          type:2
        }

        if (that.data.commentId) {
          data["comment_id"] = that.data.commentId
        }
        if(that.data.reply_user_id){
          data["reply_user_id"] = that.data.reply_user_id
        }
        wxutil.request.post(url, data).then((res) => {
          if (res.data.code == 200) {
            wx.lin.showMessage({
              type: "success",
              content: "评论成功！"
            })
            // 重新获取评论列表
            that.getComments()
            setTimeout(function () {
              wx.pageScrollTo({
                scrollTop: 1000
              })
            }, 1000)

            info.has_comment = true
            info.comment_num++
            that.setData({
              info: info,
              comment: null,
              commentId: null,
              placeholder: "评论点什么吧..."
            })
            //修改上个页面的评论数和是否评论
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            let answer_list = prevPage.data.answer_list;
            answer_list[that.data.index]['has_comment'] = 1
            answer_list[that.data.index]['comment_num'] = answer_list[that.data.index]['comment_num'] + 1
            prevPage.setData({
              answer_list: answer_list
            });
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "评论失败！"
            })
          }
        })
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
          const url = api.waAPI + 'del-comment'
          const data = {
            id: commentId,
            type:2
          }
          wxutil.request.post(url, data).then((res) => {
            if (res.data.code == 200) {
              this.getDetail(this.data.info.id)
              //修改上个页面的评论数和是否评论
              let that = this
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 2];
              let answer_list = prevPage.data.answer_list;
              answer_list[that.data.index]['comment_num'] = answer_list[that.data.index]['comment_num'] - 1
              answer_list[that.data.index]['has_comment'] = answer_list[that.data.index]['comment_num'] === 0 ? 0 : 1
              prevPage.setData({
                answer_list: answer_list
              });

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

  onShareAppMessage() {
    return {
      title: this.data.info.title,
      imageUrl: this.data.info.images[0].image_url ? this.data.info.images[0].image_url : '',
      path: "/pages/wa-detail/index?id=" + this.data.info.id
    }
  }
})
