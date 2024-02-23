const defaultAvatarUrl = '../../images/icon/default_head.png'
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    theme: wx.getSystemInfoSync().theme,
    nickName: ''
  },
  onLoad() {
    wx.onThemeChange((result) => {
      this.setData({
        theme: result.theme
      })
    })
  },
  //上传头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    console.log(avatarUrl)
    this.setData({
      avatarUrl,
    })
    const url = api.userAPI + "save_head_image"
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
          wxutil.setStorage('userDetail', userDetail, wxutil.getStorageTime('userDetail'))
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
  //保存昵称
  onEditNickname(e){
    let url = api.userAPI + 'save_nickname'
    let nickName = e.detail.value
    if(nickName == this.nickname || !nickName){
      return
    }
    console.log(e, nickName)
    let data = {'nickname':nickName}
    let userDetail = wxutil.getStorage("userDetail")
    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        userDetail.nickName = nickName
        wxutil.setStorage('userDetail', userDetail, wxutil.getStorageTime('userDetail'))
      } else {
        wx.lin.showMessage({
          type: "error",
          content: "保存失败！"
        })
      }
    })
  },
  //返回前两个页面
  goBack(){
    wx.navigateBack({
      delta: 2
    })
  }
})
