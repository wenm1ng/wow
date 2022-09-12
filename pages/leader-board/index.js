// utils/wave/waves.js
import string from "../../miniprogram_npm/lin-ui/common/async-validator/validator/string";

const app = getApp()
const api = app.api
const wxutil = app.wxutil

export function setweekOption(year) { //传入年份,字符串类型年份,'2020'
  // year = new Date().getFullYear()
  let days = getDay(year)
  // console.log(days)
  let weeks = {};
  let daySplit;
  for (let i = 0; i < days.length; i++) {
    let weeksKeyLen = Object.keys(weeks).length;
    daySplit = days[i].split('_');
    if (weeks[weeksKeyLen] === undefined) {
      weeks[weeksKeyLen + 1] = [daySplit[0]]
    } else {
      if (daySplit[1] == '1') {
        weeks[weeksKeyLen + 1] = [daySplit[0]]
      } else {
        weeks[weeksKeyLen].push(daySplit[0])
      }
    }
  }

  let nowTime = new Date().getTime();
  let option = []
  let link = [];
  let nowWeek = 0; //这周周数
  let iWeek;
  let weeksKeyLen = Object.keys(weeks).length;
  for (let i = 1; i < weeksKeyLen + 1; i++) {
    let obj = {};
    obj.year = year
    obj.week = "第" + i + "周"
    obj.md = weeks[i][0] + '-' + weeks[i][weeks[i].length - 1]
    obj.s = weeks[i][0]
    obj.e = weeks[i][weeks[i].length - 1]

    var startTime = new Date(year+'/'+obj.s).getTime();
    var endTime = new Date(year+'/'+obj.e).getTime();
    // console.log(obj.s,startArr, obj.e, endArr, 1111111);
    obj.text = "第" + i + "周" + '(' + weeks[i][0] + '-' + weeks[i][weeks[i].length - 1] + ')';
    obj.value = i;
    iWeek = option.length;
    link[iWeek] = obj.text;

    option.push(obj)
    if(startTime <= nowTime && nowTime <= endTime){
      // console.log(startTime, nowTime, endTime)
      nowWeek = i
      break;
    }

  }
  return {option, link, nowWeek};
}
export function getDay(year) {
  let dates = [];
  for (let i = 1; i <= 12; i++) {
    for (let j = 1; j <= new Date(year, i, 0).getDate(); j++) {
      dates.push(formatNumber(i) + '/' + formatNumber(j) + '_' + new Date([year, formatNumber(i), formatNumber(j)].join('-')).getDay()) //返回当年所有日期（带星期数）
    }
  }
  return dates;
}
export function formatNumber(n) {
  return n.toString().length > 1 ? n : '0' + n
}


Page({
  data: {
    startDate: '2020-01',
    endDate: wxutil.getYearMonth(),
    date: '',
    dateFormat: '',
    nowWeek: 0, //当前的周数
    weekArr: [], //今年的所有周数
    weekData: [],
    boardList: [],
    multiArray: [],
    multiIndex: [],
    years: [],
    height:1000
  },
  onLoad() {
    this.getScrollHeight();
    this.getYear();
    this.getWeekData();
    this.getLeaderBoardList();
  },

  onShow() {

  },
  getYear(){
    let nowYear = (new Date()).getFullYear();
    let years = [];
    years.push(2021);

    for(var i=2022;i <= nowYear; i++){
      years.push(i);
    }
    this.setData({
      years: years,
      multiArray: [years, []]
    })
  }
  ,
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    this.getLeaderBoardList()
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    //判断
    if(e.detail.column === 0){
      //年份
      data.multiIndex[1] = this.data.weekData[this.data.years[e.detail.value]].link.length - 1;
      data.multiArray[1] = this.data.weekData[this.data.years[e.detail.value]].link
    }
    data.multiIndex[e.detail.column] = e.detail.value;

    this.setData(data);
  },
  getWeekData: function(year){
    let multiArray = this.data.multiArray

    if(year === undefined){
      let num = this.data.multiArray[0].length
      let weekData = [];
      for (var i = 0;i <= num - 1;i++){
        weekData[this.data.multiArray[0][i]] = setweekOption(this.data.multiArray[0][i]);
      }
      //默认取最近的一周
      year = this.data.multiArray[0][num-1];
      var data = {
        weekData: weekData,
        multiIndex: this.data.multiIndex,
        nowWeek: weekData[year].nowWeek
      };
      data.multiIndex[0] = num-1;
      data.multiIndex[1] = weekData[year].nowWeek - 1

      this.setData(data)
    }
    multiArray[1] = this.data.weekData[year].link
    this.setData({
      multiArray: multiArray
    })
  },

  // bindPickerChange: function(e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.getLeaderBoardList()
  // },
  getDateFormat(date){
    return date.replace('-', '年') + '月'
  },

  getLeaderBoardList() {
    let data = {
      nowWeek: this.data.nowWeek,
    }
    if(this.data.multiIndex[1] !== undefined){
      data.week = this.data.multiIndex[1] + 1
      data.year = this.data.years[this.data.multiIndex[0]]
    }

    const url = api.userAPI + 'leader-board-list'
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          boardList: res.data.data
        })
      }
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
        console.log(windowHeight)
        const windowWidth = res.windowWidth;
        const ratio = 750 / windowWidth;
        const height = windowHeight * ratio;
        console.log(height);
        that.setData({
          height: height - 180
        })
      }
    })
  },

  //去排行榜说明页面
  gotoBoardCaption(){
    wx.navigateTo({
      url: '/pages/board-caption/index'
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
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
