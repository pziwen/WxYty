// pages/cart/index.js
/*
1 获取用户的收货地址
  1 绑定点击事件
  2 调用小程序内置api 获取用户的收货地址
  3 获取用户对小程序所授予  获取地址的  权限状态  scope
    1 假设用户点击获取收货地址的提示框  确定  authSetting scope.address
      scope 值为  true  直接调用  获取收货地址
    2 假设用户从来没有调用过  收货地址的api
      scope undefined  直接调用 获取收货地址
    3 假设用户点击  取消
      scope 值为  false
      1 诱导用户自己打开授权设置页面(wx.openSetting)  当用户重新给与  获取地址权限的时候
      2 获取收货地址
  4 把获取到的收货地址  存入到  本地存储中

2 页面加载完毕
  1 获取本地存储中的地址数据
  2 把数据设置给data中的一个变量

3 onShow
  第一次添加商品的时候  手动添加了属性
    1 num=1
    2 checked = true
  1 获取缓存中的购物车数组
  2 把购物车数据填充到data中

4 实现全选  数据的显示
  1 onshow  获取缓存中的购物车数组
  2 根据购物车中的商品数据  判断全选

5 总价格和总数量
  1 对选中的商品计算
  2 获取购物车数组
  3 遍历
  4 判断商品是否被选中
  5 总价格 += 商品单价 * 商品数量
    总数量 += 商品数量
  6 把计算后的价格和数量  设置回data中

6 商品的选中
  1 绑定change事件
  2 获取被修改的商品对象
  3 商品对象的选中状态  取反
  4 重新填充回data中和缓存中
  5 重新计算全选、总价格、总数量

7 实现全选和反选
  1 全选复选框绑定事件  change
  2 获取data中的全选变量  allChecked
  3 直接取反  allChecked = ！allChecked
  4 遍历购物车数组  让里面商品玄宗状态跟随allChecked
  5 把购物车数组和allChecked重新设置回data和缓存中

8 商品数量的编辑
  1 “+” “-” 按钮  绑定同一个点击事件  区分的关键是  自定义属性
    1 "+"=>"+1"
    2 "-"=>"-1"
  2 传递呗点击的商品id  goods_id
  3 获取data中的购物车数组  来获取需要被修改的商品对象
  4 当购物车的数量 =1 同时 用户点击 "-"
    弹窗提示  询问用户是否删除商品  wx.showModal
    1 确定  执行删除
    2 取消
  5 直接修改商品对象的数量  num
  6 把cart数组  重新设置回  缓存和data中  this.setCart

9 实现点击结算
  1 判断用户有没有选购商品
  2 判断有没有收货地址信息
  3 经过验证  跳转到  支付页面
*/

// 导入 promise
import {
  getSetting,
  chooseAddress,
  openSetting,
  showModal,
  showToast
} from '../../utils/asyncWx.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0
  },

  // 获取收货地址的定时器id
  timeId: -1,

  // 获取收货地址
  async handleChooseAddress() {

    // 获取地址信息和选购商品信息
    const {
      totalNum,
      address
    } = this.data;
    // 判断用户有没有选购商品
    if (!totalNum) {
      await showToast({
        title: "先选购商品啦"
      });
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

  // 商品选中事件
  handleItemChange(e) {
    // 获取选中商品的id
    const goods_id = e.currentTarget.dataset.id;
    // 查找缓存中的购物车数据并修改选中状态
    let {
      cart
    } = this.data;
    let index = cart.findIndex(v => goods_id === v.goods_id);
    cart[index].checked = !cart[index].checked;
    // 重新计算全选状态、总价格、总数量
    this.setCart(cart);
  },

  // 全选全不选事件
  handleAllChange() {
    let {
      cart,
      allChecked
    } = this.data;
    allChecked = !allChecked;
    cart.forEach(v => v.checked = allChecked);
    this.setCart(cart);
  },

  // 修改商品数量事件
  async handleItemEdit(e) {
    const {
      id,
      operation
    } = e.currentTarget.dataset;
    let {
      cart
    } = this.data;
    const index = cart.findIndex(v => v.goods_id === id)
    // 判断是否触发删除事件
    if (cart[index].num === 1 && operation === -1) {
      const del = await showModal({
        content: "确定删除该商品"
      });
      if (del.confirm) {
        cart.splice(index, 1)
        this.setCart(cart)
      }
    } else {
      cart[index].checked = true;
      cart[index].num += operation;
      this.setCart(cart);
    }
  },

  // 结算事件
  async handlePay() {
    // // 获取地址信息和选购商品信息
    // const {
    //   totalNum,
    //   address
    // } = this.data;
    // // 判断用户有没有选购商品
    // if (!totalNum) {
    //   await showToast({
    //     title: "先选购商品啦"
    //   });
    //   return;
    // }

    // 判断没有收货地址信息
    // if (!address.userName) {
    //   await showToast({
    //     title: "要选好收货地址哦"
    //   });
    //   return;
    // }
    //跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  },

  // 计算全选状态、总价格、总数量
  setCart(cart) {
    // 计算全选
    let allChecked = true;
    // 计算总价格和总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(v => {
      if (v.checked) {
        totalPrice += v.goods_price * v.num;
        totalNum += v.num;
      } else {
        allChecked = false;
      }
    });
    // 判断购物车数组是否为空
    allChecked = cart.length ? allChecked : false;
    this.setData({
      cart,
      allChecked,
      totalPrice,
      totalNum
    })
    wx.setStorageSync("cart", cart);
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
    const cart = wx.getStorageSync("cart") || [];
    this.setCart(cart);
  }
})