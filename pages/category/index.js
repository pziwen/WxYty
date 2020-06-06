// 导入 用来发送请求的方法 （小程序要把路径补全）
import {
  request
} from "../../request/index.js";
// 引入async语法的js文件
import regeneratorRuntime from '../../lib/runtime/runtime';

// pages/category/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 左边菜单列表数据
    leftMenuList: [],
    // 右边商品列表数据
    rightContent: [],
    // 被点击左侧的菜单
    currentIndex: 0,
    // 用于初始化右侧商品列表的滚动条
    scrollTop: 0
  },
  // 接口的返回数据
  Cates: [],

  // 获取分类列表数据
  async getCatesData() {

    // 使用es7的async await来发送请求
    const res = await request({
      url: "/categories"
    });
    this.Cates = res;
    // 进行缓存  本地存储
    wx.setStorageSync("cates", {
      time: Date.now(),
      data: this.Cates
    });
    // 构造左边菜单列表数据
    let leftMenuList = this.Cates.map(v => v.cat_name);
    // 构造右边商品列表数据
    let rightContent = this.Cates[0].children;
    this.setData({
      leftMenuList,
      rightContent,
    })
  },

  // 左侧菜单点击事件
  handleItemTap(e) {
    // 获取点击菜单的索引，更新currentIndex的值,同时更新右侧商品列表
    const {
      index
    } = e.currentTarget.dataset;
    let rightContent = this.Cates[index].children;
    this.setData({
      currentIndex: index,
      rightContent,
      // 初始化顶部位置
      scrollTop: 0
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 添加缓存效果
    const Cates = wx.getStorageSync("cates");
    if (!Cates) {
      // 未缓存
      this.getCatesData();
    } else {
      // 存在旧数据
      if (Date.now() - Cates.time > 1000 * 300) {
        // 重新发送请求
        this.getCatesData();
      } else {
        this.Cates = Cates.data;
        let leftMenuList = this.Cates.map(v => v.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  }
})