/**
 * @Author: WenMing
 * @Date: 2019-04
 */

/**
 * request用法：
 * 1.request.get(url).then((data) => {}).catch((error) => {})
 * 2.request.post(url, data = {}, header = {}).then((data) => {}).catch((error) => {})
 * 3.request.put(url, data = {}, header = {}).then((data) => {}).catch((error) => {})
 * 4.request.delete(url, data = {}, header = {}).then((data) => {}).catch((error) => {})
 * @param {String} url
 * @param {JSON Object} data
 * @param {JSON Object} header
 */
let ajaxTime = 0;
const request = {
  get(url, data = {}, header = {}) {
    const handler = { url, data, header }
    return this.Request('GET', handler)
  },

  getLoad(url, data = {}, header = {}) {
    const handler = { url, data, header }
    return this.Request('GET', handler, 1)
  },
  post(url, data = {}, header = {}) {
    const handler = { url, data, header }
    return this.Request('POST', handler)
  },

  postLoad(url, data = {}, header = {}) {
    const handler = { url, data, header }
    return this.Request('POST', handler, 1)
  },

  put(url, data = {}, header = {}) {
    const handler = { url, data, header }
    return this.Request('PUT', handler)
  },

  delete(url, data = {}, header = {}) {
    const handler = { url, data, header }
    return this.Request('DELETE', handler)
  },

  // RequestHandler
  Request(method, handler, isLoading = 0) {
    if(isLoading){
      ajaxTime++;//调用异步请求方法就加一
      wx.showLoading({//显示loading效果
        title: '加载中...',
        mask:true
      })
    }

    const { url, data, header } = handler
    let head = {
      'content-type': 'application/json'
    }
    if (getApp().getHeader) {
      const appHeader = getApp().getHeader()
      head = Object.assign(head, appHeader)
    }
    wx.showNavigationBarLoading()
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        header: Object.assign(head, header),
        method: ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method : 'GET',
        success(res) {
          getApp().gotoAuthPage(res)
          getApp().checkText(res)
          resolve(res)
        },
        fail() {
          reject('request failed')
        },
        complete() {
          wx.hideNavigationBarLoading()
          if(isLoading){
            ajaxTime--;
            if(ajaxTime === 0){
              wx.hideLoading()//关闭loading效果
            }
          }
        }
      })
    })
  }
}

/**
 * file用法：
 * 1.file.download(url).then((data) => {})
 * 2.file.upload({url: url, fileKey: fileKey, filePath: filePath, data: {}, header: {}}).then((data) => {})
 * @param {JSON Object} handler
 */
const file = {
  download(handler) {
    if (typeof handler === 'string') {
      handler = {
        url: String(handler)
      }
    }
    const { url, filePath, header } = handler
    return new Promise((resolve, reject) => {
      let head = {}
      if (getApp().getHeader) {
        const appHeader = getApp().getHeader()
        head = Object.assign(head, appHeader)
      }
      wx.showNavigationBarLoading()
      wx.downloadFile({
        url: url,
        filePath: filePath,
        header: Object.assign(head, header),
        success(res) {
          resolve(res)
        },
        fail() {
          reject('downloadFile failed')
        },
        complete() {
          wx.hideNavigationBarLoading()
        }
      })
    })
  },

  upload(handler) {
    const { url, fileKey, filePath, data, header } = handler
    return new Promise((resolve, reject) => {
      let head = {}
      if (getApp().getHeader) {
        const appHeader = getApp().getHeader()
        head = Object.assign(head, appHeader)
      }
      wx.showNavigationBarLoading()
      wx.uploadFile({
        url: url,
        name: fileKey,
        filePath: filePath,
        formData: data,
        header: Object.assign(head, header),
        success(res) {
          resolve(res)
        },
        fail() {
          reject('uploadFile failed')
        },
        complete() {
          wx.hideNavigationBarLoading()
        }
      })
    })
  }
}

/**
 * socket用法：
 * let socketOpen = false
 * socket.connect(url)
 *
 * wx.onSocketMessage((res) => {
 *  console.log(res)
 * }
 *
 * wx.onSocketOpen((res) => {
 *  socketOpen = true
 *  if socketOpen: socket.send("hello").then((data) => {})
 *  socket.close(url) || wx.closeSocket()
 * })
 * @param {String} url
 * @param {JSON Object} handler
 * @param {JSON Object} data
 */
const socket = {
  connect(url, handler = {}) {
    const { header, protocols } = handler
    let head = {
      'content-type': 'application/json'
    }
    if (getApp().getHeader) {
      const appHeader = getApp().getHeader()
      head = Object.assign(head, appHeader)
    }
    return new Promise((resolve, reject) => {
      wx.connectSocket({
        url: url,
        header: Object.assign(head, header),
        protocols: typeof protocols === 'undefined' ? [] : protocols,
        success(res) {
          resolve(res)
        },
        fail() {
          reject('connect failed')
        }
      })
    })
  },

  // 需在onSocketOpen回调内使用
  send(data) {
    return new Promise((resolve, reject) => {
      wx.sendSocketMessage({
        data: data,
        success(res) {
          resolve(res)
        },
        fail() {
          reject('sendSocketMessage failed')
        }
      })
    })
  },

  close(url) {
    wx.connectSocket({
      url: url
    })
  }
}

/**
 * image用法：
 * 1.image.save(path).then((data) => {})
 * 2.image.choose(1).then((data) => {})
 * @param {String} path
 * @param {JSON Object} urls
 */
const image = {
  save(path) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success(res) {
          resolve(res)
        },
        fail() {
          reject('saveImageToPhotosAlbum failed')
        }
      })
    })
  },

  choose(count = 9, sourceType = ['album', 'camera']) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: count,
        sourceType: sourceType,
        success(res) {
          resolve(res)
        },
        fail() {
          reject('chooseImage failed')
        }
      })
    })
  }
}

/**
 * showToast用法：
 * showToast("成功")
 * @param {String} title
 * @param {JSON Object} handler
 */
const showToast = (title, handler = {}) => {
  const { icon, image, duration, mask } = handler
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: title,
      image: image,
      icon: typeof icon === 'undefined' ? 'none' : icon,
      duration: typeof duration === 'undefined' ? 1000 : duration,
      mask: typeof mask === 'undefined' ? true : mask,
      success(res) {
        resolve(res)
      },
      fail() {
        reject('showToast failed')
      }
    })
  })
}

/**
 * showModal用法：
 * showModal("提示", "这是一个模态弹窗")
 * @param {String} title
 * @param {String} content
 * @param {JSON Object} handler
 */
const showModal = (title, content, handler = {}) => {
  const {
    showCancel,
    cancelText,
    confirmText,
    cancelColor,
    confirmColor
  } = handler
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: content,
      showCancel: typeof showCancel === 'undefined' ? true : showCancel,
      cancelText: typeof cancelText === 'undefined' ? '取消' : cancelText,
      confirmText: typeof confirmText === 'undefined' ? '确定' : confirmText,
      cancelColor: typeof cancelColor === 'undefined' ? '#000000' : cancelColor,
      confirmColor:
        typeof confirmColor === 'undefined' ? '#576B95' : confirmColor,
      success(res) {
        resolve(res)
      },
      fail() {
        reject('showModal failed')
      }
    })
  })
}

/**
 * showLoading用法：
 * showLoading("加载中")
 * @param {String} title
 * @param {Boolean} mask
 */
const showLoading = (title = "加载中...", mask = true) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: title,
      mask: mask,
      success(res) {
        resolve(res)
      },
      fail() {
        reject('showLoading failed')
      }
    })
  })
}

/**
 * showActionSheet用法：
 * showActionSheet(['A', 'B', 'C']).then((data) => {})
 * @param {Array.<String>} itemList
 * @param {String} itemColor
 */
const showActionSheet = (itemList, itemColor = '#000000') => {
  return new Promise(resolve => {
    wx.showActionSheet({
      itemList: itemList,
      itemColor: itemColor,
      success(res) {
        resolve(res.tapIndex)
      },
      fail() {
        return
      }
    })
  })
}

/**
 * setStorage用法：
 * 1.setStorage("userInfo", userInfo)
 * 2.setStorage("userInfo", userInfo, 172800)
 * @param {String} key
 * @param {Object} value
 * @param {Int} time 过期时间，可选参数
 */
const setStorage = (key, value, time) => {
  const dtime = '_deadtime'
  wx.setStorageSync(key, value)
  const seconds = parseInt(time)
  console.log(seconds);
  if (seconds > 0) {
    let timestamp = Date.parse(new Date()) / 1000 + seconds
    wx.setStorageSync(key + dtime, timestamp + '')
  } else {
    wx.removeStorageSync(key + dtime)
  }
}

const clearStorage = () => {
  wx.clearStorageSync()
}

/**
 * getStorage用法：
 * getStorage("userInfo")
 * @param {String} key
 */
const getStorage = key => {
  const dtime = '_deadtime'
  const deadtime = parseInt(wx.getStorageSync(key + dtime))
  if (deadtime && Date.parse(new Date()) / 1000 > parseInt(deadtime)) {
    return null
  }
  const res = wx.getStorageSync(key)
  if (typeof (res) == "boolean") {
    return res
  }
  return res ? res : null
}

const getStorageTime = key => {
  const dtime = '_deadtime'
  const deadtime = parseInt(wx.getStorageSync(key + dtime))
  if (deadtime && Date.parse(new Date()) / 1000 > parseInt(deadtime)) {
    return null
  }
  return parseInt(deadtime) - Date.parse(new Date()) / 1000
}

/**
 * getLocation用法：
 * getLocation().then((data) => {})
 * @param {String} type
 * @param {Boolean} watch
 */
const getLocation = (type = 'gcj02', watch = false) => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: type,
      success(res) {
        resolve(res)
        const latitude = res.latitude
        const longitude = res.longitude
        if (watch) {
          wx.openLocation({
            latitude,
            longitude,
            scale: 18
          })
        }
      },
      fail() {
        reject('getLocation failed')
      }
    })
  })
}

/**
 * getUserInfo用法：
 * getUserInfo(true).then((data) => {})
 * @param {Boolean} login
 * @param {String} lang
 */
const getUserInfo = (login = false, lang = 'zh_CN') => {
  let code = null
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      withCredentials: login,
      lang: lang,
      success(res) {
        if (login) {
          wx.login({
            success(data) {
              code = data.code
              res.code = code
              resolve(res)
            }
          })
        } else {
          resolve(res)
        }
      },
      fail() {
        reject('getUserInfo failed')
      }
    })
  })
}

//新授权
const getUserProfile = (login = false, lang = 'zh_CN') => {
  let code = null
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: 'save userInfo to DB',
      lang: lang,
      success(res) {
        if (login) {
          wx.login({
            success(data) {
              code = data.code
              res.code = code
              resolve(res)
            },
            fail(){
              reject('login failed')
            }
          })
        } else {
          resolve(res)
        }
      },
      fail() {
        reject('getUserProfile failed')
      }
    })
  })
}

/**
 * 微信支付 - requestPayment用法:
 * requestPayment({timeStamp: timeStamp, nonceStr: nonceStr, packageValue: packageValue, paySign: paySign}).then((data) => {})
 * @param {JSON Object} handler
 */
const requestPayment = handler => {
  const { timeStamp, nonceStr, packageValue, paySign, signType } = handler
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: packageValue,
      paySign: paySign,
      signType: typeof signType === 'undefined' ? 'MD5' : signType,
      success(res) {
        resolve(res)
      },
      fail() {
        reject('requestPayment failed')
      }
    })
  })
}

/**
 * 小程序自动更新 - autoUpdate用法:
 * autoUpdate()
 */
const autoUpdate = () => {
  const updateManager = wx.getUpdateManager()
  updateManager.onCheckForUpdate(res => {
    if (res.hasUpdate) {
      updateManager.onUpdateReady(() => {
        showModal('更新提示', '新版本已经准备好，是否重启应用？').then(res => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        })
      })
      updateManager.onUpdateFailed(() => {
        showModal(
          '更新提示',
          '新版本已经准备好，请删除当前小程序，重新搜索打开'
        )
      })
    }
  })
}

/**
 * 判断字符串是否不为空 - isNotNull用法：
 * isNotNull("text")
 * @param {String} text 字符串
 * @return {Boolean} 字符串合法返回真否则返回假
 */
const isNotNull = text => {
  if (text == null) {
    return false
  }
  if (text.match(/^\s+$/)) {
    return false
  }
  if (text.match(/^\s*$/)) {
    return false
  }
  if (text.match(/^[ ]+$/)) {
    return false
  }
  if (text.match(/^[ ]*$/)) {
    return false
  }
  return true
}

/**
 * 获取日期时间 - getDateTime用法：
 * getDateTime()
 * @param {Date} date 'yy-mm-dd hh:MM:ss'
 */
const getDateTime = (date = new Date()) => {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 0 && day <= 9) {
    day = '0' + day
  }
  if (hour >= 0 && hour <= 9) {
    hour = '0' + hour
  }
  if (minute >= 0 && minute <= 9) {
    minute = '0' + minute
  }
  if (second >= 0 && second <= 9) {
    second = '0' + second
  }
  return (
    year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  )
}

/**
 * 获取时间戳 - getTimestamp用法：
 * getTimestamp()
 * @param {Date} date
 */
const getYearMonth = (date = new Date()) => {
  var year = date.getFullYear()
  var month = '0' + (date.getMonth() + 1)
  return year + '-' + month
}

const getTimestamp = (date = new Date()) => {
  return date.getTime()
}

//获取现在的周数
const getWeekInYear = () => {
  var endDate = new Date(),
      curYear = endDate.getFullYear(),
      startDate = new Date(curYear, 0, 1);

  var startWeek = startDate.getDay(), // 1月1号是星期几:0-6
      offsetWeek = 0; //用来计算不完整的第一周，如果1月1号为星期一则为0，否则为1

  if (startWeek !== 1) {
    offsetWeek = 1;
    if (!startWeek) {
      startDate.setDate(1);
    } else {
      startDate.setDate(8 - startWeek); // (7 - startWeek + 1)
    }

  }
  var distanceTimestamp = endDate - startDate;
  var days = Math.ceil(distanceTimestamp / (24 * 60 * 60 * 1000)) + startWeek;
  return Math.ceil(days / 7) + offsetWeek;
}

//获取当前周的开始日期和结束日期
const getWeekDate = () => {
  const one_day = 86400000;// 24 * 60 * 60 * 1000;
  const date = new Date();
  const day = date.getDay();// 返回0-6,0表示周日
  // 设置时间为当天的0点
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  const week_start_time = date.getTime() - (day - 1) * one_day;
  const week_end_time = date.getTime() + (7 - day) * one_day;

  let startDate = new Date(week_start_time);
  let endDate = new Date(week_end_time);

  startDate = startDate.getFullYear() + '年' + (startDate.getMonth()+1 < 10 ? '0'+(startDate.getMonth()+1) : startDate.getMonth()+1) + '月' + startDate.getDate() + '日';
  endDate = endDate.getFullYear() + '年' + (endDate.getMonth()+1 < 10 ? '0'+(endDate.getMonth()+1) : endDate.getMonth()+1) + '月' + endDate.getDate() + '日';
  return {
    startDate,
    endDate
  }
}

function yearDay(long){
  var time = new Date(long * 1000)
  var year = time.getFullYear();
  var month = (time.getMonth()+1) < 10 ? '0' + (time.getMonth()+1) : (time.getMonth()+1);
  var date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate() ;
  return {year,month,date}
}
//计算一年中的每一周都是从几号到几号
//第一周为1月1日到 本年的 第一个周日
//第二周为 本年的 第一个周一 往后推到周日
//以此类推 再往后推52周。。。
//如果最后一周在12月31日之前，则本年有垮了54周，反之53周
//12月31 日不论是周几，都算为本周的最后一天
//参数年份 ，函数返回一个数组，数组里的对象包含 这一周的开始日期和结束日期
const whichWeek = (year) => {
  var d = new Date(year, 0, 1);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }
  let arr = []
  let longnum = d.setDate(d.getDate())
  if(longnum > +new Date(year, 0, 1)){
    let obj = yearDay(+new Date(year, 0, 1) / 1000)
    obj.last = yearDay( longnum / 1000 - 86400)
    arr.push(obj)
  }
  let oneitem = yearDay(longnum / 1000)
  oneitem.last = yearDay( longnum / 1000 + 86400 * 6)
  arr.push(oneitem)
  var lastStr
  for(var i = 0 ; i<51 ;i++){
    let long = d.setDate(d.getDate() + 7)
    let obj = yearDay( long / 1000)
    obj.last = yearDay( long / 1000 + 86400 * 6)
    lastStr = long + 86400000 * 6
    arr.push(obj)
  }
  if(lastStr < +new Date(year + 1, 0, 1)){
    let obj = yearDay(lastStr / 1000 + 86400)
    obj.last = yearDay(+new Date(year + 1, 0, 1) / 1000 - 86400)
    arr.push(obj)
  }else{
    arr[arr.length-1].last = yearDay(+new Date(year + 1, 0, 1) / 1000 - 86400)
  }
  return arr
}


const timestampToData = (timestamp) => {
  var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return Y+M+D+h+m+s;
}


const getTimeSign = () => {
  let time = this.getTimestamp() - 10
  return time.slice(0, -1) + '0';
}

module.exports = {
  request: request,
  file: file,
  socket: socket,
  image: image,
  showToast: showToast,
  showModal: showModal,
  showLoading: showLoading,
  showActionSheet: showActionSheet,
  setStorage: setStorage,
  clearStorage: clearStorage,
  getStorage: getStorage,
  getStorageTime: getStorageTime,
  getLocation: getLocation,
  getUserInfo: getUserInfo,
  requestPayment: requestPayment,
  autoUpdate: autoUpdate,
  isNotNull: isNotNull,
  getDateTime: getDateTime,
  getTimestamp: getTimestamp,
  getYearMonth: getYearMonth,
  getWeekInYear: getWeekInYear,
  getWeekDate: getWeekDate,
  whichWeek: whichWeek,
  getUserProfile: getUserProfile
}
