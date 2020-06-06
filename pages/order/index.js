/*
1 页面被打开的时候 onShow （onShow不同于onLoad，无法在形参上接受options参数）
  1 判断缓存中有没有token
    1 没有  跳转到获取授权页面
    2 有  往下进行
  2 获取url上的参数type
  3 根据type去发送请求获取订单数据
  4 渲染页面
2 点击不同的标题，重新发送请求来获取和渲染数据
*/

import {request} from "../../request/index.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        id: 0,
        value: "全部",
        isActive: true
      },
      {
        id: 1,
        value: "待付款",
        isActive: false
      },
      {
        id: 2,
        value: "待收货",
        isActive: false
      },
      {
        id: 3,
        value: "退款/退货",
        isActive: false
      }
    ],
    orders: []
  },

  handleTabsItemChange(e) {
    // 获取被点击的标题索引
    const {index} = e.detail;
    this.changeTitleByIndex(index);
    // 切换title重新发送请求获取数据
    // this.getOrders(index + 1);

    // 获取缓存中的订单数据
    let orders = wx.getStorageSync("orders");
    this.setData({orders})
  },

  // Tabs切换
  changeTitleByIndex(index) {
    // 修改源数组
    let {tabs} = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    // 赋值到data中
    this.setData({tabs})
  },

  // 获取订单列表
  async getOrders(type) {
    const {orders} = await request({
      url: "/my/orders/all",data: {type}});
    this.setData({
      orders
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 先判断是否存在token
    // const token = wx.getStorageSync("token");
    // if (!token) {
    //   wx.navigateTo({
    //     url: '/pages/auth/index',
    //   });
    //   return;
    // }
    // 获取页面栈
    // let pages = getCurrentPages();
    // let currentPage = pages[pages.length - 1];
    // const {type} = currentPage.options;
    // this.changeTitleByIndex(type - 1);
    // this.getOrders(type);

    // 获取缓存中的订单数据
    let orders = wx.getStorageSync("orders");
    this.setData({orders})
  }
})