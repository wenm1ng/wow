const baseAPI = "https://api.july.yejiefeng.com/api/v1/"
// const baseAPI2 = "http://119.29.1.85:9909/api/v1/"
const baseAPI2 = "http://192.168.39.101:9909/api/v1/"
// const socketAPI = "ws://119.29.1.85:9909"
const socketAPI = "ws://192.168.39.101:9909"
const imageBgUrl = "http://wenming.online/public/wow/image/bg/";
const imageIconUrl = "http://wenming.online/public/wow/image/icon/";
const imageBrowUrl = "http://119.29.1.85:83/brow/";

module.exports = {
  baseAPI, // 根接口
  userAPI: baseAPI2 + "user/", // 用户接口
  versionAPI: baseAPI2 + "version/", // 版本接口
  waAPI: baseAPI2 + "wa/", // wa接口
  helpCenterAPI: baseAPI2 + "help-center/", // wa接口
  occupationAPI: baseAPI2 + "occupation/", // 职业接口
  talentAPI: baseAPI2 + "talent/", // 天赋接口
  socketAPI: socketAPI, // Socket接口
  labelAPI: baseAPI + "label/", // 标签接口
  topicAPI: baseAPI + "topic/", // 话题接口
  holeAPI: baseAPI + "hole/", // 树洞接口
  followingAPI: baseAPI + "following/", // 关注接口
  commentAPI: baseAPI + "comment/", // 评论接口
  starAPI: baseAPI + "star/", // 收藏接口
  templateAPI: baseAPI + "template/", // 模板接口
  messageAPI: baseAPI + "message/", // 消息接口
  chatAPI: baseAPI2 + 'chat-room/', // 聊天接口
  imageBgUrl,
  imageIconUrl,
  imageBrowUrl
}
