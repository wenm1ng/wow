// utils/wave/waves.js
import string from "../../miniprogram_npm/lin-ui/common/async-validator/validator/string";

const app = getApp()
const api = app.api
const wxutil = app.wxutil

export function setweekOption(year) { //传入年份,字符串类型年份,'2020'
  year = new Date().getFullYear()
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

    var startArr = weeks[i][0].split('/');
    var endArr = obj.e.split('/');
    console.log(obj.s,startArr, obj.e, endArr, 1111111);
    if(new Date(year, parseInt(startArr[0]), parseInt(startArr[1])).getTime() <= nowTime <= new Date(year, parseInt(endArr[0]), parseInt(endArr[1])).getTime()){
      nowWeek = i
    }
    obj.text = "第" + i + "周" + '(' + weeks[i][0] + '-' + weeks[i][weeks[i].length - 1] + ')';
    obj.value = i;
    iWeek = option.length;
    link[iWeek] = obj.text;

    option.push(obj)

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
    years: []
  },
  onLoad() {
    this.getYear();
    this.getWeekData();
    console.log(this.data.nowWeek);
    let weekArr = []
    for (let i = 1;i <= this.data.nowWeek;i++){
      weekArr.push(this.data.weekData.option[i-1].text);
    }
    this.setData({
      weekArr: weekArr,
      date: this.data.nowWeek
    })
  },

  onShow() {

  },
  getYear(){
    let nowYear = (new Date()).getFullYear();
    let years = [];
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
    this.getWeekData(e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;

    this.setData(data);
  },
  getWeekData: function(year){
    year = year | this.data.multiArray[0][0]
    let weekData = setweekOption(year);
    let multiArray = this.data.multiArray
    console.log(year, weekData, multiArray);
    multiArray[1] = weekData.link
    this.setData({
      weekData: weekData,
      multiArray: multiArray,
      nowWeek: weekData.nowWeek
    })
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let num = parseInt(e.detail.value)
    this.setData({
      date: num + 1,
    })
    this.getLeaderBoardList()
  },
  getDateFormat(date){
    return date.replace('-', '年') + '月'
  },

  getLeaderBoardList() {

    const url = api.userAPI + 'wallet/get-money?type=' + 1
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          money: res.data.data['money']
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
      title: "主页",
      path: "/pages/wa/index"
    }
  }
})
