/*
1 输入框绑定 值改变事件 input事件
  1 获取到输入框的值
  2 合法性判断
  3 检验通过  把输入框的值发送到后台
  4 返回的数据打印到页面上
2 防抖（防止抖动）定时器
  1 声明一个全局定时器id
*/

import {request} from '../../request/index.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    // 取消按钮是否显示
    isfocus: false,
    // 输入框的值
    inpValue: ''
  },

  TimeId: -1,

  // 监听输入框的值
  handleInput(e){
    // 获取输入框的值
    const {value} = e.detail;
    // 检测合法性
    if (!value.trim()) {
      // 不合法
      this.setData({goods: [], isFocus: false});
      return
    }
    this.setData({isFocus: true});
    // 发送请求获取数据
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(() => {
      this.qsearch(value);
    }, 1000);
  },

  // 发送请求获取搜索数据
  async qsearch(query){
    const goods = await request({url: "/goods/qsearch", data: {query}});
    this.setData({goods});
  },

  // 取消按钮事件
  handleCancel(){
    this.setData({
      inpValue: '',
      isFocus: false,
      goods: []
    })
  }

})