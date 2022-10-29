// pages/stake-1/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
var that; //wx data对象
var count = 0;
var isGCD = false;
var timer = undefined; //定时器对象
var repeatData = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pixelLeft:0,
    pixelTop:0,
    pixelWidth: 128,
    pixelHeight: 128,
    arrMask: [],
    tickID: 0,
    stage: 0,
    inCD: false,
    skillPositionArr: [],
    nowIndexArr: [], //当前使用的技能下标
    skillLink: [], //每个技能inCD等数据
    skillList: [], //技能详细数据
    finalSkillList: [], //技能筛选后的数据
    repeatData: [], //技能定时器去重数据
    isShake: false,
    energy: 100, //能量条
    isEnergy: true, //当前职业是否有能量条
    imgList: [],
    finalImgList: [],
    modalShow: false,
    modalHeight: 400,
    nowInfoIndex: 0,
    stakeShow: false,
    timer: [],
    showActionBar: false, //是否显示施法动作条
    actionBar: 0, //动作条进度（根据施法时间来）
    isAccess: true, //是否可以执行技能步骤
    allHurt: 0, //总伤害
    averageHurt: 0, //秒伤
    autoHurt: 0, //自动攻击显伤
    skillHurt: 0, //主动技能直接伤害显伤
    userPower: 20, //玩家力量
    autoPower: 50, //自动攻击伤害(攻击力)
    stakeArmor: 4000, //木桩人护甲
    stakeReduceInjury: 0, //木桩人减伤
    stakeParry: 15, //木桩人招架概率
    stakeDodge: 6.5, //木桩人躲闪几率
    userCrit: 20, //用户暴击率
    beginTime: 0, //伤害测试开始时间戳
    userBoost: 100, //用户增伤强度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this
    that.getSkill()
    this.setData({
      stakeReduceInjury: (this.stakeArmor / (this.stakeArmor + 10555)).toFixed(4)
    })
  },
  getImageInfo(e){
    this.setData({
      nowInfoIndex: e.detail.index,
      modalShow: true
    })
  },
  //关闭弹窗
  closeModal(){
    this.setData({
      modalShow: false
    })
  },
  /**
   * 设置定时器
   */
  setTimer(){
    let promiseArr = [];
    let promise = new Promise((resolve, reject) => {
      // //这里可以写要发的请求，这里以上传为例
      // let timer = [];
      // let temp
      // that.data.finalSkillList.forEach(function(v,k){
      //   temp = setInterval(function(){
      //     setTimeout(function(){that.onDraw(k)}, 0)
      //   }, v.cool_time <= 0 ? 2 : v.cool_time * 2)
      //   //2对应1秒
      //   timer.push(temp)
      // })
      // that.setData({
      //   timer: timer
      // })
      timer = setInterval(function(){
        setTimeout(function(){
          that.data.finalSkillList.forEach(function(v,k){
            if(v.cool_time === 0){
              //没有CD，则使用公共GCD
              if(that.data.skillLink[k].inCD){
                that.onDraw(k)
              }
            }else{
              that.onDraw(k)
            }
            // if (((count * 4) % v.cool_time) === 0) {
            //   that.onDraw(k)
            // }
            // that.onDraw(k)
          })
          count++
        }, 0)
      }, 125)
    });
    promiseArr.push(promise)
    if(this.data.isEnergy){
      //如果是有能量条（集中值、怒气）的职业，才进行能量条自动回复
      let promiseOther = new Promise((resolve, reject) => {
        //额外操作
        setInterval(function(){
          setTimeout(function(){
            if(that.data.energy !== 100){
              var energy = that.data.energy + 1
              if(energy > 100){
                energy = 100
              }
              that.setData({
                energy: energy
              })
            }
          }, 0)
        }, 300)
      });
      promiseArr.push(promiseOther)
    }

    //自动攻击定时器
    setInterval(function(){
      //自动攻击显伤 = 自动攻击伤害 * 木桩人护甲
      let autoHurt = that.getCritNum(that.data.autoPower * that.data.stakeArmor / 100)
      let allHurt = that.data.allHurt + autoHurt
      that.setData({
        autoHurt: autoHurt,
        allHurt: allHurt,
        averageHurt: parseInt(allHurt / ((Date.now() - that.data.beginTime) / 1000))
      })
      setTimeout(function(){
        that.setData({
          autoHurt: 0
        })
      }, 1000)
    }, 2000)
//Promise.all处理promiseArr数组中的每一个promise对象
    Promise.all(promiseArr).then((result) => {
      //在存储对象的数组里的所有请求都完成时，会执行这里
      console.log(111)
    })
  },
  /**
   * 数值暴击
   * @param Num
   * @returns {number|*}
   */
  getCritNum(Num){
    if(Math.floor(Math.random()*100+1) <= this.data.userCrit){
      return Num * 2
    }
    return Num
  },
  /**
   * 拖动、删除图片后的操作
   * @param e
   */
  updateImageList(e){
    // let temp = [];
    // e.detail.list.forEach(function(val,key){
    //   temp[val] = key
    // })
    this.setData({
      finalImgList: e.detail.list
    })
  },
  /**
   * 重置技能
   */
  resetSkill(){
    this.getSkill()
  },
  /**
   * 确认技能,准备伤害测试
   */
  confirmSkill(){
    let finalSkillList = [];
    let imgLink = []
    let nowImgLink = [];
    that.data.skillList.forEach(function(v,k){
      nowImgLink['https://mingtongct.com/images/skill/'+v.icon] = k
    })
    that.data.finalImgList.forEach(function(v,k){
      var imageUrl = 'https://mingtongct.com/images/skill/' + that.data.skillList[k].icon
      if(imageUrl !== v){
        imgLink[k] = v
      }else{
        finalSkillList[k] = that.data.skillList[k]
      }
    })
    imgLink.forEach(function(v,k){
      //替换顺序
      var nowIndex = nowImgLink[v]
      finalSkillList[k] = that.data.skillList[nowIndex]
    })
    let skillPositionArr = [];
    var length = finalSkillList.length
    for (var i=0;i<length;i++){
      skillPositionArr[i] = that.data.skillPositionArr[i]
    }
    this.setData({
      finalSkillList: finalSkillList,
      skillPositionArr: skillPositionArr,
      stakeShow: true,
      beginTime: Date.now()
    })
    this.setTimer()
  },
  /**
   * 获取技能列表
   */
  getSkill(){
    let temp
    let tempLink
    let skillPositionArr = []
    let skillLink = []
    let imgList = [];

    const url = api.damageAPI + 'skill-list'
    const data = {version:2, oc:'zs'}
    wxutil.request.get(url, data).then((res) => {
      if(res.data.code === 200){
        res.data.data.forEach(function(v){
          temp = [
            {display:"none",width:0, height:0, borderLeftWidth:0, borderBottomWidth:64},
            {display:"none",width:0, height:0, borderTopWidth:0, borderLeftWidth:64},
            {display:"none",width:64, height:0, borderRightWidth:0, borderTopWidth:64},
            {display:"none",width:0, height:64, borderBottomWidth:0, borderRightWidth:64},
          ]

          tempLink = {inCD:false,tickID:0,stage:0}
          skillLink.push(tempLink)
          skillPositionArr.push(temp);
          imgList.push('https://mingtongct.com/images/skill/'+v.icon);
        })
        that.setData({
          skillList: res.data.data,
          finalSkillList: res.data.data,
          skillPositionArr: skillPositionArr,
          skillLink: skillLink,
          imgList:imgList,
          finalImgList:imgList
        })
      }
    })
  },
  test(){
    this.setData({
      energy: this.data.energy - 10
    })
  },
  onDraw(index) {
    // if(that.data.finalSkillList[index].consume + that.data.energy >= 0){
    //   console.log(that.data.finalSkillList[index].consume, that.data.energy)
    // }
    if (index === undefined || !that.data.skillLink[index].inCD || that.data.finalSkillList[index].consume + that.data.energy < 0){
      return;
    }

    var x = 0;
    if(that.data.finalSkillList[index].cool_time === 0){
      x = 64
    }else{
      x = 64 / that.data.finalSkillList[index].cool_time
    }
    var i = (parseFloat(that.data.skillLink[index].tickID) + parseFloat(x)).toFixed(2);

    let arrMask = that.data.skillPositionArr;
    let skillLink = that.data.skillLink;
    skillLink[index].tickID = i;

    // console.log(that.data.skillLink[index].stage)
    // var repeat = index.toString() + that.data.skillLink[index].stage.toString()
    // repeat = parseInt(repeat)

    // var repeatName = 'repeatData['+repeat+']'
    // that.setData({
    //   [repeatName]: 1
    // })
    if(skillLink[index].stage >= 9){
      skillLink[index].stage = 0
    }
    if(that.data.finalSkillList[index].cool_time === 0){
      //设置公共GCD
      isGCD = true
    }

    switch(that.data.skillLink[index].stage) {
      case 0:
        arrMask[index][0].borderLeftWidth = i;
        break;
      case 1:
        arrMask[index][0].height = i + 2;
        arrMask[index][0].borderBottomWidth = 64 - i;
        break;
      case 2:
        arrMask[index][1].borderTopWidth = i;
        break;
      case 3:
        arrMask[index][1].width = i;
        arrMask[index][1].borderLeftWidth = (64-i);
        break;
      case 4:
        arrMask[index][2].width = 64 - i;
        arrMask[index][2].borderRightWidth = i;
        break;
      case 5:
        arrMask[index][2].height = i;
        arrMask[index][2].borderTopWidth = (64-i);
        break;
      case 6:
        arrMask[index][3].height = 64 - i;
        arrMask[index][3].borderBottomWidth = i;
        break;
      case 7:
        arrMask[index][3].width = i;
        arrMask[index][3].borderRightWidth = (64-i);
        break;
      case 8:
        skillLink[index].inCD = false;
        // console.log(index,'wenming')
        // console.log(Date.now());
        for(i=0; i<4; i++)
          arrMask[index][i].display = "none";
        if(that.data.finalSkillList[index].cool_time === 0){
          //设置公共GCD
          isGCD = false
        }
        break;
    }

    if (skillLink[index].tickID >= 64) {
      skillLink[index].tickID = 0;
      skillLink[index].stage = skillLink[index].stage + 1;
    }
    // skillLink[index].isEnergy = that.data.finalSkillList[index].consume + that.data.energy >= 0
    // skillLink[index].isEnergy = true

    var positionName = 'skillPositionArr['+index+']'
    var linkName = 'skillLink['+index+']'
    that.setData({
      [positionName]: arrMask[index],
      [linkName]: skillLink[index],

    })

  },
  handleMouseDown(event){
    var index = event.currentTarget.dataset.index
    var energy = that.data.energy + that.data.finalSkillList[index].consume;
    energy = energy > 100 ? 100 : energy;

    if(that.data.skillLink[index].inCD || energy < 0 || that.data.showActionBar){
      return;
    }


    let skillLink = that.data.skillLink
    skillLink[index].tickID = 0;
    skillLink[index].stage = 0;

    var indexArr = that.data.nowIndexArr
    indexArr.push(index)

    if(this.data.finalSkillList[index].cool_time === 0){
      isGCD = true
    }
    //如果技能有施法时间，加载施法动作条
    if(that.data.finalSkillList[index].read_time > 0){
      let temp;
      let showActionBar;
      let bar = setInterval(function(){
        temp = (10 / that.data.finalSkillList[index].read_time) + that.data.actionBar;
        showActionBar = temp < 100

        that.setData({
          actionBar: temp,
          showActionBar: showActionBar,
        })
        if(!showActionBar){
          clearInterval(bar)
          that.setData({
            pixelLeft: 0,
            pixelTop: 0,
            pixelWidth: 128,
            pixelHeight: 128,
            skillLink: skillLink,
            energy: energy,
            nowIndexArr: indexArr,
            actionBar: 0
          })
          that.onReset(index)
          setTimeout(function(){
            that.setData({
              isShake: false
            })
          },1000)
        }
      },100)
    }else{
      this.setData({
        pixelLeft: 0,
        pixelTop: 0,
        pixelWidth: 128,
        pixelHeight: 128,
        skillLink: skillLink,
        energy: energy,
        nowIndexArr: indexArr
      })
      this.onReset(index)
      setTimeout(function(){
        that.setData({
          isShake: false
        })
      },1000)
    }
  },
  onReset(index){
    var newArr = this.data.skillPositionArr
    let skillLink = that.data.skillLink
    if(this.data.finalSkillList[index].cool_time === 0){
      this.data.finalSkillList.forEach(function(v, k){
        if(v.cool_time === 0){
          if(that.data.energy + v.consume < 0){
            //能量不够，跳出循环
            // skillLink[k].isEnergy = false
            return
          }
          newArr[k][0].display = 'block'
          newArr[k][1].display = 'block'
          newArr[k][2].display = 'block'
          newArr[k][3].display = 'block'
          newArr[k][0].width = 0;
          newArr[k][0].height = 0;
          newArr[k][0].borderLeftWidth = 0;
          newArr[k][0].borderBottomWidth = 64;

          newArr[k][1].width = 0;
          newArr[k][1].height = 0;
          newArr[k][1].borderTopWidth = 0;
          newArr[k][1].borderLeftWidth = 64;


          newArr[k][2].width = 64;
          newArr[k][2].height = 0;
          newArr[k][2].borderRightWidth = 0;
          newArr[k][2].borderTopWidth = 64;

          newArr[k][3].width = 0;
          newArr[k][3].height = 64;
          newArr[k][3].borderBottomWidth = 0;
          newArr[k][3].borderRightWidth = 64;
          skillLink[k].inCD = true;
          skillLink[k].tickID = 0;
          skillLink[k].stage = 0;
          // skillLink[k].isEnergy = true;
        }
      })
    }else{
      // skillLink[index].isEnergy = this.data.finalSkillList[index].consume + that.data.energy >= 0;
      if(this.data.finalSkillList[index].consume + that.data.energy >= 0){
        newArr[index][0].display = 'block'
        newArr[index][1].display = 'block'
        newArr[index][2].display = 'block'
        newArr[index][3].display = 'block'
        newArr[index][0].width = 0;
        newArr[index][0].height = 0;
        newArr[index][0].borderLeftWidth = 0;
        newArr[index][0].borderBottomWidth = 64;

        newArr[index][1].width = 0;
        newArr[index][1].height = 0;
        newArr[index][1].borderTopWidth = 0;
        newArr[index][1].borderLeftWidth = 64;


        newArr[index][2].width = 64;
        newArr[index][2].height = 0;
        newArr[index][2].borderRightWidth = 0;
        newArr[index][2].borderTopWidth = 64;

        newArr[index][3].width = 0;
        newArr[index][3].height = 64;
        newArr[index][3].borderBottomWidth = 0;
        newArr[index][3].borderRightWidth = 64;
        skillLink[index].inCD = true;
        skillLink[index].tickID = 0;
        skillLink[index].stage = 0;
      }
    }
    // newArr[index].forEach(function(v, k){
    //   newArr[index][k].display = 'block'
    // })


    // var positionName = 'skillPositionArr['+index+']'
    // var linkName = 'skillLink['+index+']'
    that.setData({
      // [positionName]: newArr[index],
      skillPositionArr: newArr,
      skillLink: skillLink,
      // [linkName]: skillLink[index],
      isShake: true,
      skillHurt: this.data.finalSkillList[index].hurt
    })
    // console.log(Date.now());

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    if(timer !== undefined){
      clearInterval(timer)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if(timer !== undefined){
      clearInterval(timer)
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
