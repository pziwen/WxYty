/**
 * 1  页面加载的时候
 *  1 从缓存中获取购物车数据  渲染到页面中
 *    这些数据必须  checked=true
 * 2  微信支付
 *  1 哪些人  哪些帐号  可以实现微信支付
 *    1 企业帐号
 *    2 企业帐号的小程序后台中  必须  给开发者  添加上白名单
 *      1 一个  appid 可以同时绑定多个开发者
 *      2 这些开发者就可以公用这个APPID和它的开发权限
 * 3  支付按钮
 *  1 先判断缓存中有没有token
 *  2 没有  跳转到授权页面  进行获取token
 *  3 有token
 *  4 创建订单  获取订单编号
 *  5 已经完成微信支付
 *  6 手动删除缓存中  已经被选中的商品
 *  7 删除后的购物车数据  重新填充回缓存
 *  8 再跳转页面
 */

// 导入 promise
import {
  showToast,
  requestPayment,
  getSetting,
  openSetting,
  chooseAddress
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
    cart: [],
    totalPrice: 0,
    totalNum: 0
  },
  timeId: -1,

  // 获取收货地址
  async handleChooseAddress() {
    try {
      // 调用  chooseAddress  获取收货地址
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      wx.setStorageSync("address", address);
      this.setData({
        address
      })
    } catch (error) {
      console.log(error);
    }

  },

  // 支付事件
  async handleOrderPay() {
    try {
      // 先判断缓存中是否存在token
      // const token = wx.getStorageSync("token");
      // if (!token) {
      //   wx.navigateTo({
      //     url: '/pages/auth/index'
      //   });
      //   return;
      // }
      // 创建订单
      // 准备 请求头参数
      // const header = {
      //   Authorization: token
      // }
      // 准备 请求体参数
      // const order_price = this.data.totalPrice;
      // const consignee_addr = this.data.address.all;
      // const cart = this.data.cart;
      // let goods = [];
      // cart.forEach(v => goods.push({
      //   goods_id: v.goods_id,
      //   goods_number: v.num,
      //   goods_price: v.goods_price
      // }))
      // const orderParams = {
      //   order_price,
      //   consignee_addr,
      //   goods
      // };
      // 发送请求 创建订单  获取订单编号
      // const {
      //   order_number
      // } = await request({
      //   url: "/my/orders/create",
      //   data: orderParams,
      //   method: "POST"
      // });
      // 发起 预支付
      // const {
      //   pay
      // } = await request({
      //   url: "/my/orders/req_unifiedorder",
      //   method: "POST",
      //   data: {
      //     order_number
      //   }
      // });
      // 发起 微信支付
      // await requestPayment(pay);
      // 查询后台 订单状态
      // await request({
      //   url: "/my/orders/chkOrder",
      //   method: "POST",
      //   data: {
      //     order_number
      //   }
      // })
      wx.showLoading({
        title: "正在支付",
        mask: true
      });
      clearTimeout(this.timeId);
      this.timeId = setTimeout(async () => {
        wx.hideLoading();
        await showToast({
          title: "支付成功"
        })

        // 加一步判断，分立即购买和购物车购买
        const pages = getCurrentPages();
        if (pages[pages.length - 2].route === "pages/goods_detail/index") {

          let payCart = this.data.cart[0];
          let str = this.randomStr(4),
            dateId = new Date();
          // 生成订单信息
          let orders = [{
            order_number: str + dateId.getFullYear() + (dateId.getMonth() + 1) + (dateId.getDay()) + dateId.getTime() + payCart.goods_id,
            order_price: payCart.goods_price * payCart.num,
            consignee_addr: this.data.address.all,
            create_time: dateId.getFullYear() + '/' + (dateId.getMonth() + 1) + '/' + dateId.getDay() + ' ' + dateId.getHours() + ':' + dateId.getMinutes() + ':' + dateId.getSeconds(),
            goods: {
              goods_id: payCart.goods_id,
              goods_price: payCart.goods_price,
              goods_number: payCart.num,
              goods_total_price: payCart.goods_price * payCart.num,
              goods_name: payCart.goods_name,
              goods_small_logo: payCart.goods_small_logo
            }
          }];
          // 订单数据存入缓存
          let OldOrders = wx.getStorageSync("orders") || [];
          let NewOrders = [...OldOrders, ...orders];
          wx.setStorageSync("orders", NewOrders);
          // 初始化
          this.setData({
            cart: [],
            totalPrice: 0,
            totalNum: 0
          })

        } else {
          // 手动删除缓存中 已经支付了的商品
          let newCart = wx.getStorageSync("cart");

          // 因为没有支付权限，主要的功能都无法实现
          // 在删除缓存中支付的商品数据之前，缓存一个新数据，用于实现订单查询功能
          let payCart = newCart.filter(v => v.checked);
          // 生成订单信息
          let orders = [];
          payCart.forEach(v => {
            let str = this.randomStr(4),
              dateId = new Date();
            orders.push({
              order_number: str + dateId.getFullYear() + (dateId.getMonth() + 1) + (dateId.getDay()) + dateId.getTime() + v.goods_id,
              order_price: v.goods_price * v.num,
              consignee_addr: this.data.address.all,
              create_time: dateId.getFullYear() + '/' + (dateId.getMonth() + 1) + '/' + dateId.getDay() + ' ' + dateId.getHours() + ':' + dateId.getMinutes() + ':' + dateId.getSeconds(),
              goods: {
                goods_id: v.goods_id,
                goods_price: v.goods_price,
                goods_number: v.num,
                goods_total_price: v.goods_price * v.num,
                goods_name: v.goods_name,
                goods_small_logo: v.goods_small_logo
              }
            })
          })
          // 将订单数据存入缓存中
          let OldOrders = wx.getStorageSync("orders") || [];
          let NewOrders = [...OldOrders, ...orders];
          wx.setStorageSync("orders", NewOrders);
          // 再删除缓存中已经购买的商品数据
          newCart = newCart.filter(v => !v.checked);
          wx.setStorageSync("cart", newCart);
        }

        // 支付成功 跳转到订单页面
        wx.redirectTo({
          url: '/pages/order/index'
        });
      }, 1500);

    } catch (error) {
      console.log(error);
      await showToast({
        title: "支付失败"
      })
    }
  },

  // 生成随机大写字母
  randomStr(num) {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWSYZ';
    let res = '';
    for (var i = 0; i < num; i++) {
      let index = Math.floor(Math.random() * (str.length));
      res += str.substring(index, index + 1);
    }
    return res;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 判断上一个页面是不是商品详情(用户点击直接购买)
    const pages = getCurrentPages();
    if (pages[pages.length - 2].route === "pages/goods_detail/index") {
      // 获取缓存中的数据
      const address = wx.getStorageSync("address");
      let cart = [pages[pages.length - 2].data.buyGoods];
      // 计算总价格和总数量
      let totalPrice = 0;
      let totalNum = 0;
      cart.forEach(v => {
        totalPrice += v.goods_price * v.num;
        totalNum += v.num;
      });
      this.setData({
        address,
        cart,
        totalPrice,
        totalNum
      })
    } else {
      // 获取缓存中的数据
      const address = wx.getStorageSync("address");
      let cart = wx.getStorageSync("cart") || [];
      // 获取过滤后的购物车数组
      cart = cart.filter(v => v.checked);

      // 计算总价格和总数量
      let totalPrice = 0;
      let totalNum = 0;
      cart.forEach(v => {
        totalPrice += v.goods_price * v.num;
        totalNum += v.num;
      });
      this.setData({
        address,
        cart,
        totalPrice,
        totalNum
      })
    }
  }

})