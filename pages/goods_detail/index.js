/*
1 发送请求获取数据
2 点击轮播图 预览大图
  1 给轮播图绑定点击事件
  2 调用小程序的api previewImage
3 点击  加入购物车
  1 先绑定点击事件
  2 获取缓存中的购物车数据  数组格式
  3 先判断  当前的商品是否已经存在于购物车
  4 已经存在  修改商品数据  执行购物车数量++  重新把购物车数组填充回缓存中
  5 不存在于购物车的数组中  直接给购物车数组添加一个新元素  新元素带上购买数量属性  num 重新把购物车数组填充回缓存中
  6 弹出提示

4 商品收藏
  1 页面onShow的时候  加载魂村中的商品收藏数据
  2 判断当前商品是否被收藏
    1 是  改变商品收藏的图标
    2 不是  正常显示
  3 点击商品收藏按钮
    1 判断该商品是否存在于缓存数组中
    2 已经存在  把该商品删除
    3 没有存在  把商品添加到收藏数组中  存在到缓存中即可

5 点击立即购买
  1 判断
*/
import {
  getSetting,
  chooseAddress,
  openSetting,
  showToast
} from '../../utils/asyncWx.js';

import {
  request
} from "../../request/index.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    goodsObj: {},
    // 记录该商品收藏状态
    isCollect: false,
    // 用于立即购买商品的数据
    buyGoods: {},
    // 记录用户是否登录
    isLogin: true
  },
  GoodsData: {},

  // 获取商品数据
  async getGoodsDetail(goods_id) {
    const goodsObj = await request({
      url: "/goods/detail",
      data: {
        goods_id
      }
    });
    this.GoodsData = goodsObj;

    // 获取缓存中的收藏商品数据
    let collect = wx.getStorageSync("collect") || [];
    // 判断当前商品是否被收藏
    let isCollect = collect.some(v => v.goods_id === this.GoodsData.goods_id)

    this.setData({
      // goodsObj,
      // 因为获取的属性太多，而且用不到，所以可以优化一下数据
      goodsObj: {
        goods_id: goodsObj.goods_id,
        goods_name: goodsObj.goods_name,
        goods_price: goodsObj.goods_price,
        // 部分iphone手机不识别 webp 图片格式
        // 最好找后台修改
        // 临时自己修改
        goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: goodsObj.pics,
      },

      // 收藏的商品数据
      isCollect
    })
  },

  // 点击轮播图全屏预览事件
  handlePreviewImage(e) {
    const urls = this.data.goodsObj.pics.map(v => v.pics_mid);
    const currentNum = e.currentTarget.dataset.index;
    wx.previewImage({
      current: urls[currentNum],
      urls: urls
    });
  },

  // 点击 加入购物车
  handleCartAdd() {
    // 判断是否已经登录小程序
    const userinfo = wx.getStorageSync("userinfo");
    if (!userinfo.nickName) {
      // 登录
      this.setData({
        isLogin: false
      })
      return;
    }
    // 获取本地购物车缓存
    const cart = wx.getStorageSync("cart") || [];
    // 判断当前商品是否存在于购物车缓存中
    let index = cart.findIndex(v => v.goods_id == this.GoodsData.goods_id);
    if (index == -1) {
      // 不存在 也就是第一次添加
      this.GoodsData.num = 1;
      this.GoodsData.checked = true;
      cart.push(this.GoodsData);
    } else {
      // 存在 增加数量
      cart[index].num++;
    }
    // 重新存入缓存中
    wx.setStorageSync("cart", cart);
    // 弹出提示
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      mask: true
    });
  },

  // 点击收藏商品
  handleCollect() {
    // 判断是否已经登录小程序
    const userinfo = wx.getStorageSync("userinfo");
    if (!userinfo.nickName) {
      // 登录
      this.setData({
        isLogin: false
      })
      return;
    }
    let isCollect = false;
    let collect = wx.getStorageSync("collect") || [];
    let index = collect.findIndex(v => v.goods_id === this.GoodsData.goods_id);
    // 判断是否收藏
    if (index !== -1) {
      // 能找到，及收藏过，删除该收藏商品
      collect.splice(index, 1);
      isCollect = false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true,
      });
    } else {
      // 没有收藏过
      collect.push(this.GoodsData);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true,
      });
    }
    // 重新缓存
    wx.setStorageSync("collect", collect);
    this.setData({
      isCollect
    })
  },

  // 点击立即购买
  async handleBuy() {
    // // 判断是否已经登录小程序
    // const userinfo = wx.getStorageSync("userinfo");
    // if (!userinfo.nickName) {
    //   // 登录
    //   this.setData({
    //     isLogin: false
    //   })
    //   return;
    // }
    this.setData({
      buyGoods: {
        ...this.GoodsData,
        num: 1
      }
    });
    // // 判断是否已经选择收货地址
    // const address = wx.getStorageSync("address");
    // if (!address) {
    //   await showToast({title: "请选择收货地址"});
    //   clearTimeout(this.timeId);
    //   this.timeId = setTimeout(()=>{
    //     this.handleChooseAddress();
    //   },1500)
    //   return;
    // }
    //跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  },

  // 获取收货地址
  async handleChooseAddress() {

    // 判断是否已经登录小程序
    const userinfo = wx.getStorageSync("userinfo");
    if (!userinfo.nickName) {
      // 登录
      this.setData({
        isLogin: false
      })
      return;
    }

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
    } catch (error) {
      console.log(error);
    }
  },

  // 点击登录
  handleGetUserInfo(e) {
    const userinfo = e.detail.userInfo;
    wx.setStorageSync("userinfo", userinfo);
    this.setData({
      isLogin: true
    })
  },

  //不登录
  async handleLoginNo() {
    this.setData({
      isLogin: true
    })
    await showToast({
      title: "登录后才能使用该功能哦╰(*°▽°*)╯"
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取缓存中的数据
    const address = wx.getStorageSync("address");
    this.setData({
      address
    })
    let pages = getCurrentPages();
    let {
      goods_id
    } = pages[pages.length - 1].options;
    this.getGoodsDetail(goods_id);
  }

})