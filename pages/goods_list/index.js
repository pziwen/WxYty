// pages/goods_list/index.js
// 导入 用来发送请求的方法 （小程序要把路径补全）
import { request } from "../../request/index.js";
// 引入async语法的js文件
import regeneratorRuntime from '../../lib/runtime/runtime';

/*
1 用户上滑页面 滚动条触底 开始加载下一页数据
  1 找到滚动条触底事件
  2 判断是否存在下一页数据
    1 获取总页数  只有总条数
      总页数 = Math.ceil（总条数 / 页容量pagesize）
    2 获取到当前的页码  pagenum
    3 判断  当前页码是否大于等于总页数
      1没有下一页数据  弹出提示
      2存在下一页数据  加载下一页数据
        1当前页码++
        2重新发送请求
        3拼接数据

2 下拉刷新页面
  1 触发下拉刷新时间  需要在页面的json文件中开启相关配置项
    找到  触发下拉刷新的事件
  2 重置 数据 数组
  3 重置页码 设置为1
  4 重新发送请求
*/

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: "综合",
        isActive: true
      },
      {
        id: 1,
        value: "销量",
        isActive: false
      },
      {
        id: 2,
        value: "价格",
        isActive: false
      }
    ],
    goodsList: []
  },
  // 接口需要的参数
  QueryParams: {
    query: "",
    cid: "",
    pagenum: 1,
    pagesize: 10
  },
  // 商品列表总页数
  totalPages: 1,

  // 标题点击事件  子组件传递过来的
  handleTabsItemChange (e) {
    // 获取被点击的标题索引
    const {index} = e.detail;
    // 修改源数组
    let {tabs} = this.data;
    tabs.forEach((v,i) => i === index ? v.isActive = true : v.isActive = false );
    // 赋值到data中
    this.setData({
      tabs
    })
  },

  async getGoodsList () {
    const res = await request({url:"/goods/search",data:this.QueryParams});
    const total = res.total;
    // 计算总页数
    this.totalPages = Math.ceil(total / this.QueryParams.pagesize);
    this.setData({
      goodsList: [...this.data.goodsList,...res.goods]
    })

    // 关闭下拉刷新状态  即便是下拉刷新事件还没执行也不会报错
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryParams.cid = options.cid || "";
    this.QueryParams.query = options.query || "";
    this.getGoodsList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 判断是否还有下一页商品数据
    if (this.QueryParams.pagenum >= this.totalPages) {
      // 没有下一页
      wx.showToast({
        title: '已经到底啦',
        icon: 'none'
      });
    } else {
      // 还有下一页
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },

  // 用户下拉事件处理函数
  onPullDownRefresh: function () {
    // 重置数组
    this.setData({
      goodsList: []
    })
    // 重置页码
    this.QueryParams.pagenum = 1;
    // 重新发送请求
    this.getGoodsList();
  }
})