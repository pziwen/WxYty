/*
1 点击“+”触发tap点击事件
  1 调用小程序内置的选择图片的api
  2 获取到图片的路径  数组
  3 把图片路径存到data的变量中
  4 页面就可以根据图片数组  进行循环显示  自定义组件

2 点击自定义图片组件
  1 获取被点击的元素的索引
  2 获取data中的图片数组
  3 根据索引在数组中删除对应的元素
  4 把数组重新设置回data中

3 点击提交
  1 获取文本域的内容
  2 对这些内容进行合法性验证
  3 验证通过，用户选择的图片，上传到专门的图片的服务器，返回图片外网的连接
    1 遍历图片数组
    2 挨个上传
    3 自己再维护图片数组、存放图片上传后的外网的连接
  4 文本域和外网的图片的路径一起提交到服务器  这里在前端只做模拟
  5 清空当前页面
  6 返回上一页
*/

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        id: 0,
        value: "体验问题",
        isActive: true
      },
      {
        id: 1,
        value: "商品商家投诉",
        isActive: false
      }
    ],
    // 上传的图片路径
    chooseImgs: [],
    // 文本域的内容
    textVal: ""
  },

  // 外网的图片路径
  UpLoadImgs: [],

  handleTabsItemChange(e) {
    // 获取被点击的标题索引
    const {
      index
    } = e.detail;
    // 修改源数组
    let {
      tabs
    } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    // 赋值到data中
    this.setData({
      tabs
    })
  },

  // 上传图片
  handleChooseImg() {
    wx.chooseImage({
      // 同时选中的图片的数量
      count: 9,
      // 图片的格式 原图  压缩
      sizeType: ['original', 'compressed'],
      // 图片的来源 相册  照相机
      sourceType: ['album', 'camera'],
      success: (result) => {
        this.setData({
          // 数据进行拼接，满足用户上传多次的需求
          chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths]
        })
      }
    });
  },

  // 删除图片
  handleRemoveImg(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const {
      chooseImgs
    } = this.data;
    chooseImgs.splice(index, 1);
    this.setData({
      chooseImgs
    })
  },

  // 文本域的输入事件
  handleTextInput(e) {
    this.setData({
      textVal: e.detail.value
    })
  },

  // 提交事件
  handleFormSubmit() {
    const {
      textVal,
      chooseImgs
    } = this.data;
    if (!textVal.trim()) {
      // 不合法
      wx.showToast({
        title: '请输入正确的内容',
        icon: 'none',
        mask: true
      });
      return;
    }
    wx.showLoading({
      title: "正在上传中",
      mask: true,
    });
    // 以下操作因为新浪图床开启了防盗链执行不了，只能手动搞了
    // 上传图片到专门的图片服务器
    // 上传文件的api不支持多个文件同时上传，遍历数组挨个上传
    // 判断是否需要上传图片
    // if (chooseImgs.length != 0) {
    //   chooseImgs.forEach((v, i) => {
    //     var upTask = wx.uploadFile({
    //       // 图片要上传到的位置   这里用的是新浪图床的一个链接
    //       url: 'https://img.coolcr.cn/index/api.html',
    //       // 呗上传的文件的路径
    //       filePath: v,
    //       // 上传的文件的名称，后台用来获取文件，自定义的
    //       name: file,
    //       // 顺带的文本信息
    //       formData: {},
    //       success: (result) => {
    //         let url = JSON.parse(result.data.url);
    //         this.UpLoadImgs.push(url);

    //         // 当所有图片都上传完毕后才触发
    //         if (i === chooseImgs.length - 1) {
    //           // 重置页面
    //           this.setData({
    //             textVal: "",
    //             chooseImgs: []
    //           })
    //           wx.hideLoading();
    //           // 返回上一个页面
    //           wx.navigateBack({
    //             delta: 1
    //           });
    //         }
    //       }
    //     });
    //   });
    // } else {
    //   wx.hideLoading();
    //   // 返回上一个页面
    //   wx.navigateBack({
    //     delta: 1
    //   });
    // }

    wx.hideLoading();
    // 返回上一个页面
    wx.navigateBack({
      delta: 1
    });
  }

})