import {getSetting,openSetting,chooseAddress,showToast} from "../../utils/asyncWx.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {},
    // 收藏商品的数量
    collectNums: 0
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const userinfo = wx.getStorageSync("userinfo");
    const collect = wx.getStorageSync("collect") || [];
    this.setData({userinfo, collectNums: collect.length})
  },

  // 点击登录
  handleGetUserInfo(e){
    const userinfo = e.detail.userInfo;
    wx.setStorageSync("userinfo", userinfo);
    this.setData({userinfo})
  },

  // 获取收货地址
  async handleChooseAddress() {

    // 优化 获取收货地址
    try {
      // 1  获取权限状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      // 2  判断权限状态
      if (scopeAddress === false) {
        // 3  调用  openSetting 诱导重新开启权限
        await openSetting();
      }
      // 4  调用  chooseAddress  获取收货地址
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      wx.setStorageSync("address", address);
      // 提示
      wx.showToast({
        title: '保存地址',
        icon: 'success',
        mask: true
      });
    } catch (error) {
      console.log(error);
    }

  },

  // 点击关于我们
  async handleMe(){
    await showToast({title: "携猫带酒与天涯"});
  }

})