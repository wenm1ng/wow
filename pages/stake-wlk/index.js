// pages/stake-1/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
var that; //wx data对象
var count = 0;
var isGCD = false;
var timer = undefined; //定时器对象
var skillTimer = {} //技能dot每秒伤害定时器
var foreverSkillEffect = {} //永久技能效果
var skillCritNum = {} //技能暴击次数
var skillKeepTimer = {} //持续性效果技能对象
var skillResetTimer = {} // 技能重置时间前释放对象
var skillOverlayNums = {} //技能叠加次数
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
    isShake: false, //直接技能伤害文字是否显示
    dotShake: false, //dot技能伤害文字是否显示
    petShake: false, //宠物技能伤害文字是否显示
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
    dotHurt: 0, //dot技能显伤
    petHurt: 0, //宠物伤害显伤
    userPower: 1000, //玩家攻击强度
    userRapid: 100, //用户急速等级 攻击速度 = 武器攻速系数 / (急速等级 / 100 + 1)
    userAttackSpeed: 0, //用户攻击速度
    autoPower: 0, //自动攻击单次伤害
    stakeArmor: 4000, //木桩人护甲
    stakeReduceInjury: 0, //木桩人减伤
    stakeParry: 15, //木桩人招架概率
    stakeDodge: 6.5, //木桩人躲闪几率
    userCrit: 20, //用户暴击率
    beginTime: 0, //伤害测试开始时间戳
    userBoost: 100, //用户增伤强度
    oc: 'zs', //当前职业
    ocName: '战士',
    selectOc: '',
    selectVersion: '',
    ocIndex: '',
    versionList: [],
    stageList: [],
    version: 4,
    versionName: 'WLK',
    stage_name: 'P1',
    selectStage: '',
    ocList: [],
    //各职业武器参数
    weaponParams: {
      fs: {
        attackPower : 243,
        attackSpeed: 2.99,
        name: '法师'
      },
      ss: {
        attackPower : 243,
        attackSpeed: 2.99,
        name: '术士'
      },
      xd: {
        attackPower : 243,
        attackSpeed: 2.99,
        name: '德鲁伊'
      },
      zs: {
        attackPower : 435,
        attackSpeed: 3.8,
        name: '战士'
      },
      sq: {
        attackPower : 389,
        attackSpeed: 3.6,
        name: '圣骑士'
      },
      lr: {
        attackPower : 378,
        attackSpeed: 3.7,
        name: '猎人'
      },
      ms: {
        attackPower : 265,
        attackSpeed: 3.2,
        name: '牧师'
      },
      dz: {
        attackPower : 257,
        attackSpeed: 2.7,
        name: '潜行者'
      },
      sm: {
        attackPower : 435,
        attackSpeed: 2.8,
        name: '牧师'
      },
      dk: {
        attackPower : 435,
        attackSpeed: 2.8,
        name: '死亡骑士'
      },
    },
    showOcModal: false,
    showVersionModal: false,
    showStageModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this
    that.getVersion()
    that.getStage()
    that.getOc()
    that.getSkill()
    let oc = this.data.oc
    //攻击速度 攻击速度 = 武器攻速系数 / (急速等级 / 100 + 1)
    let userAttackSpeed = this.data.weaponParams[oc].attackSpeed / (this.data.userRapid / 100 + 1)
    // console.log(this.data.weaponParams[oc].attackPower, userAttackSpeed)
    this.setData({
      //攻击速度
      userAttackSpeed: userAttackSpeed,
      //自动攻击单次伤害 = (攻击强度 + 武器基础伤害 ) / 14 * 攻击速度
      autoPower: (this.data.userPower + this.data.weaponParams[oc].attackPower) / 14 * userAttackSpeed,
      //木桩人减伤百分比
      stakeReduceInjury: (this.data.stakeArmor / (this.data.stakeArmor + 10555)).toFixed(4),
      oc: oc
    })
  },
  versionModalShow(){
    this.versionDefault(this.data.version, 1)
    this.setData({
      showVersionModal: true
    })
  },
  versionModalClose(){
    this.setData({
      showVersionModal: false
    })
  },
  //显示选择职业modal
  ocModalShow(){
    let ocList = this.ocDefault(this.data.oc)
    this.setData({
      showOcModal: true,
      ocList: ocList,
    })
  },
  ocModalClose(){
    this.setData({
      showOcModal: false
    })
  },
  stageModalShow(){
    this.stageDefault(this.data.stage_name)
    this.setData({
      showStageModal: true,
    })
  },
  stageModalClose(){
    this.setData({
      showStageModal: false
    })
  },
  ocDefault(oc){
    let ocList = this.data.ocList;
    ocList.forEach(function(v, k){
      if(v.occupation === oc){
        ocList[k].is_checked = true
      }else{
        ocList[k].is_checked = false
      }
    })
    return ocList
  },
  versionDefault(version, status){
    if(status === 0){
      return;
    }
    let versionList = this.data.versionList;
    versionList.forEach(function(v, k){
      if(v.version === version && v.status === 1){
        versionList[k].is_checked = true
      }else{
        versionList[k].is_checked = false
      }
    })
    this.setData({
      versionList: versionList
    })
  },
  stageDefault(stage){
    let stageList = this.data.stageList;
    stageList.forEach(function(v, k){
      if(v.stage_name === stage){
        stageList[k].is_checked = true
      }else{
        stageList[k].is_checked = false
      }
    })
    this.setData({
      stageList: stageList
    })
  },
  selectOc(event){
    let oc = event.currentTarget.dataset.oc
    let ocList = this.ocDefault(oc)

    this.setData({
      ocList: ocList,
      selectOc: oc
    })
  },
  submitOc(){
    this.setData({
      oc: this.data.selectOc
    })
    this.getSkill();
    this.ocModalClose()
  },
  selectVersion(event){
    let status = event.currentTarget.dataset.status
    if(status === 0){
      return;
    }
    let version = event.currentTarget.dataset.version
    this.versionDefault(version, status)

    this.setData({
      selectVersion: version
    })
  },
  submitVersion(){
    if(this.data.selectVersion !== this.data.version){
      this.setData({
        version: this.data.selectVersion
      })
      this.getOc()
      this.getSkill()
      this.getStage()
    }
    this.versionModalClose()
  },
  selectStage(event){
    let stage_name = event.currentTarget.dataset.stage
    this.stageDefault(stage_name)

    this.setData({
      selectStage: stage_name
    })
  },
  submitStage(){
    this.setData({
      stage_name: this.data.selectStage
    })
    this.stageModalClose()
  },
  //获取可用版本
  getVersion() {
    const url = api.damageAPI + 'get-usage-version'
    wxutil.request.get(url).then((res) => {
      if(res.data.code === 200){
        that.setData({
          versionList: res.data.data,
          version: res.data.data[0].version,
          versionName: res.data.data[0].name
        })
      }
    })
  },
  //获取版本的团本阶段
  getStage(){
    const url = api.damageAPI + 'get-version-stage'
    const data = {
      version: this.data.version
    }
    wxutil.request.get(url, data).then((res) => {
      if(res.data.code === 200){
        that.setData({
          stageList: res.data.data,
          stage_name: res.data.data[0].stage_name
        })
      }
    })
  },
  getOc(){
    const url = api.occupationAPI + 'get-occupation-list'
    const data = {
      version: this.data.version
    }
    wxutil.request.get(url, data).then((res) => {
      if(res.data.code === 200){
        that.setData({
          ocList: res.data.data,
          oc: res.data.data[0].occupation,
          ocName: res.data.data[0].name
        })
      }
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
      let autoHurt = that.getCritNum(that.data.autoPower * (1 - that.data.stakeReduceInjury))
      let allHurt = that.data.allHurt + autoHurt
      that.setData({
        autoHurt: parseInt(autoHurt),
        allHurt: parseInt(allHurt),
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
      return Num * 2 * (that.data.userBoost/100)
    }
    return Num * (that.data.userBoost/100)
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
      nowImgLink['https://mingtongct.com/images/wlk_skill/'+v.icon + '.jpg'] = k
    })
    that.data.finalImgList.forEach(function(v,k){
      var imageUrl = 'https://mingtongct.com/images/wlk_skill/' + that.data.skillList[k].icon + '.jpg'
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
    const data = {version:this.data.version, oc:this.data.oc}
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
          imgList.push('https://mingtongct.com/images/wlk_skill/'+v.icon+ '.jpg');
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
    let skillHurt = parseInt(that.getCritNum(this.data.finalSkillList[index].hurt * (1 - that.data.stakeReduceInjury)))
    let allHurt = parseInt(that.data.allHurt + skillHurt)
    that.setData({
      // [positionName]: newArr[index],
      skillPositionArr: newArr,
      skillLink: skillLink,
      //技能类型 1直伤 2增伤 3增加暴击率 4降低护甲 5降低敌人攻击 6提升对伤害没用的属性 7普攻附带伤害 没想起来的暂时无备注',
    })
    this.onHurtCharge(this.data.finalSkillList[index])

  },
  //获取直接技能伤害
  getSkillDamage(hurt, is_weapon_hurt){
    return (that.data.userPower/14) * 2.4 + hurt + (is_weapon_hurt ? this.data.weaponParams[that.data.oc].attackPower : 0)
  },
  //伤害判断逻辑
  onHurtCharge(data){
    //没有实际数值的技能直接跳过
    if(data.hurt === 0 && data.second_hurt === 0 && data.every_second_hurt === 0){
      return;
    }
    let hurt = data.hurt
    //如果定时执行期间又有同类型的buff，直接停止该定时器
    if(skillTimer.hasOwnProperty('i'+data.ws_id)){
      clearInterval(skillTimer['i'+data.ws_id])
    }
    //如果已经有永久技能效果，跳过
    if(foreverSkillEffect.hasOwnProperty('i'+data.ws_id)){
      return;
    }
    switch(data.hurt_type){
      case 1:
          //直接造成伤害
          if(data.keep_time > 0){
            //dot伤害
            if(data.every_second_hurt > 0){
              //直接伤害
              if(data.hurt > 0){
                hurt = that.getSkillDamage(hurt, data.is_weapon_hurt)

                that.onSetHurt(hurt, 1)
              }
              hurt = data.every_second_hurt + (data.is_weapon_hurt ? this.data.weaponParams[that.data.oc].attackPower : 0)

            }else{
              //keep_time 下 产生 hurt 伤害
              hurt = parseInt(data.hurt / data.keep_time)
            }
            //造成伤害，后面每秒造成多少伤害

            skillTimer['i'+data.ws_id] = setInterval(function(){
              that.onSetHurt(hurt, 2)
            }, 1000)
            setTimeout(function(){
              clearInterval(skillTimer['i'+data.ws_id])
            }, data.keep_time)
          }else{
            //直接伤害 = (攻击强度/14)X2.4+常数C
            hurt = that.getSkillDamage(hurt, data.is_weapon_hurt)
            that.onSetHurt(hurt, 1)
          }
        break;
      case 2:
          //增加攻击强度（属性）
          if(skillKeepTimer.hasOwnProperty('i'+data.ws_id)){
            //说明已有效果在生效，只重置时间
            hurt = 0
            clearTimeout(skillKeepTimer['i'+data.ws_id])
          }
          if(data.hurt_unit === 1){
            //固定增加
            that.setData({
              autoPower: (that.data.userPower + hurt + that.data.weaponParams[that.data.oc].attackPower) / 14 * that.data.userAttackSpeed,
            })
          }else{
            //百分比增加
            that.setData({
              autoPower:  parseInt(that.data.autoPower + that.data.autoPower * (hurt / 100)),
            })
          }
          if(data.second_hurt > 0){
            //如果有增属性，并且造成伤害的技能，直接造成伤害
            hurt = that.getSkillDamage(data.second_hurt, data.is_weapon_hurt)
            that.onSetHurt(hurt, 1)
          }
          if(data.keep_time > 0){
            //重置属性
            skillKeepTimer['i'+data.ws_id] = setTimeout(function(){
              that.onResetPower()
              skillKeepTimer['i'+data.ws_id] = undefined
            }, data.keep_time)
          }else{
            //记录技能Id，永久效果只能触发一次
            foreverSkillEffect['i'+data.ws_id] = 1
          }

        break;
      case 3:
          //增加暴击率
          if(skillKeepTimer.hasOwnProperty('i'+data.ws_id)){
            //说明已有效果在生效，只重置时间
            hurt = 0
            clearTimeout(skillKeepTimer['i'+data.ws_id])
          }
          that.setData({
            userCrit: that.data.userCrit + hurt
          })
          if(data.keep_time > 0){
            //有持续时间
            skillKeepTimer['i'+data.ws_id] = setTimeout(function(){
              that.setData({
                userCrit: that.data.userCrit - data.hurt
              })
              skillKeepTimer['i'+data.ws_id] = undefined
            }, data.keep_time)

          }else{
            //记录技能Id，永久效果只能触发一次
            foreverSkillEffect['i'+data.ws_id] = 1
          }
          if(data.hurt_take_times > 0){
            //暴击只作用于前几次技能
            skillCritNum['i'+data.ws_id] = data.hurt_take_times
          }
        break;
      case 4:
          //降低护甲
          if(skillOverlayNums.hasOwnProperty('i'+data.ws_id) && skillResetTimer.hasOwnProperty('i'+data.ws_id)){
            if(skillOverlayNums['i'+data.ws_id] >= data.hurt_times){
              hurt = 0
              clearTimeout(skillResetTimer['i'+data.ws_id])
            }else{
              that.setData({
                stakeArmor: that.data.stakeArmor - skillOverlayNums['i'+data.ws_id] * hurt
              })
            }
            //有持续时间
            skillResetTimer['i'+data.ws_id] = setTimeout(function(){
              that.setData({
                stakeArmor: that.data.stakeArmor + skillOverlayNums['i'+data.ws_id] * hurt
              })
              skillResetTimer['i'+data.ws_id] = undefined
            }, data.keep_time)
          }else{

            if(skillKeepTimer.hasOwnProperty('i'+data.ws_id)){
              //说明已有效果在生效，只重置时间
              hurt = 0
              clearTimeout(skillKeepTimer['i'+data.ws_id])
            }
            that.setData({
              stakeArmor: that.data.stakeArmor - hurt
            })
            if(data.keep_time > 0){
              //有持续时间
              skillResetTimer['i'+data.ws_id] = setTimeout(function(){
                that.setData({
                  stakeArmor: that.data.stakeArmor + data.hurt
                })
                skillKeepTimer['i'+data.ws_id] = undefined

              }, data.keep_time)

              if(data.hurt_times > 0){
                skillOverlayNums['i'+data.ws_id] = 1;
              }
            }else{
              //记录技能Id，永久效果只能触发一次
              foreverSkillEffect['i'+data.ws_id] = 1
            }
          }
        break;
      case 7:
        //增加普攻伤害
          if(data.keep_time > 0 ){
            //联合创新
            // autoPower
            if(skillKeepTimer.hasOwnProperty('i'+data.ws_id)){
              //说明已有效果在生效，只重置时间
              hurt = 0
              clearTimeout(skillKeepTimer['i'+data.ws_id])
            }
            that.setData({
              autoPower: that.data.autoPower + hurt
            })
            //有持续时间
            skillKeepTimer['i'+data.ws_id] = setTimeout(function(){
              that.setData({
                autoPower: that.data.autoPower - hurt
              })
              skillKeepTimer['i'+data.ws_id] = undefined

            }, data.keep_time)

          }
          if(data.second_hurt > 0){
            hurt = that.getSkillDamage(data.second_hurt, data.is_weapon_hurt)
            that.onSetHurt(hurt, 1)
          }
        break;
      case 8:
        //增加所有伤害百分比
          if(data.keep_time > 0){
            if(skillKeepTimer.hasOwnProperty('i'+data.ws_id)){
              //说明已有效果在生效，只重置时间
              hurt = 0
              clearTimeout(skillKeepTimer['i'+data.ws_id])
            }
            that.setData({
              userBoost: that.data.userBoost + hurt
            })
            //有持续时间
            skillKeepTimer['i'+data.ws_id] = setTimeout(function(){
              that.setData({
                userBoost: that.data.userBoost - hurt
              })
              skillKeepTimer['i'+data.ws_id] = undefined

            }, data.keep_time)
          }else{
            //记录技能Id，永久效果只能触发一次
            foreverSkillEffect['i'+data.ws_id] = 1
            that.setData({
              userBoost: that.data.userBoost + hurt
            })
          }
        break;
      case 9:
        //回能量
          if(data.keep_time > 0){
            if(skillKeepTimer.hasOwnProperty('i'+data.ws_id)){
              //重置回复能量效果，并且刷新时间
              clearTimeout(skillKeepTimer['i'+data.ws_id])
            }
            let everyEnergy = parseInt(hurt / data.keep_time)
            skillTimer['i'+data.ws_id] = setInterval(function(){
              var temp = that.data.energy + everyEnergy
              that.setData({
                energy: temp > 100 ? 100 : temp
              })
            }, 1000)
            //有持续时间
            skillKeepTimer['i'+data.ws_id] = setTimeout(function(){
              clearInterval(skillTimer['i'+data.ws_id])
            }, data.keep_time)
          }else{
            var temp = that.data.energy + hurt
            if(temp > 100){
              temp = 100
            }
            that.setData({
              energy: temp
            })
          }
        break;
    }
  },
  onResetPower(){
    this.setData({
      autoPower: (this.data.userPower + this.data.weaponParams[this.data.oc].attackPower) / 14 * that.data.userAttackSpeed,
    })
  },
  //技能伤害计算
  onSetHurt(hurt, type){
    let skillHurt = parseInt(that.getCritNum(hurt * (1 - that.data.stakeReduceInjury)))
    let allHurt = parseInt(that.data.allHurt + skillHurt)
    let object = {
      allHurt: allHurt,
      averageHurt: parseInt(allHurt / ((Date.now() - that.data.beginTime) / 1000))
    }
    switch(type){
      case 1:
        //直接技能伤害
          object.isShake = true
          object.skillHurt = skillHurt
        break;
      case 2:
        //dot伤害
        object.dotHurt = skillHurt
        object.dotShake = true
        break;
      case 3:
        //宠物伤害
        object.petHurt = skillHurt
        object.petShake = true
        break;
    }
    that.setData(object)
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
