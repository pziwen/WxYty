import {
  request
} from "../../request/index.js";
// 导入 promise
import {
  login
} from '../../utils/asyncWx.js';
Page({

  // 获取权限事件
  async handleGetUserInfo(e) {
    try {
      // 获取用户信息
      const {
        encryptedData,
        rawData,
        iv,
        signature
      } = e.detail;
      // 获取小程序登录成功后的code
      const {code} = await login();
      const loginParams = {encryptedData,rawData,iv,signature,code};
      // const {token} = await request({
      //   url: "/users/wxlogin",
      //   data: loginParams,
      //   method: "post"
      // });
      const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo";
      // 缓存获取到的token 同时跳转回上一个页面
      wx.setStorageSync("token", token);
      wx.navigateBack({
        delta: 1
      });
    } catch (error) {
      console.log(error);
    }
  }
})