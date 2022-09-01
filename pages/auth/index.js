// pages/auth/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {},
  onLoad() {
    if (wxutil.getUserProfile) {
      console.log(1111111111111);
      this.setData({
        canUseGetUserProfile: true
      })
    }
  },

  /**
   * 授权
   */
  getUserProfile() {
    let data = {}
    wxutil.getUserProfile(true).then((result) => {
      console.log(result)
      //业务逻辑
      data["code"] = result.code
      data['encryptedData'] = result.encryptedData
      data['iv'] = result.iv
      data['userInfo'] = result.userInfo
      const url = api.userAPI

      app.setModelId();

      wxutil.request.post(url, data).then((res) => {
        if (res.data.code == 200) {
          // 缓存用户详细信息
          wxutil.setStorage("userDetail", res.data.data, 172800)
          // app.getUserDetailNew() = res.data.data
          // console.log(app.getUserDetailNew())
          wx.lin.showMessage({
            type: "success",
            content: "授权成功！",
            success() {
              // let pages = getCurrentPages();
              // let prevPage = pages[pages.length - 2];
              // let lastPage = prevPage.route
              // if(lastPage === 'pages/profile/index'){
              //   prevPage.getUser();
              //   prevPage.getNum();
              // }
              //将消息未读数量显示
              app.showMessageNum()
              wx.navigateBack()
            }
          })
        } else {
          wx.lin.showMessage({
            type: "error",
            content: "授权失败！"
          })
        }
      })
    })
  },

  onShareAppMessage() {
    return {
      title: "授权",
      path: "/pages/auth/index"
    }
  }
})
