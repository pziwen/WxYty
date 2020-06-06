// 记录同时发送异步请求代码的次数
let ajaxTimes = 0;
export const request = (params) => {

  // 封装一个请求头
  // 判断url中国是否带有 /my/ 请求的是私有的路径  带上header token
  let header = {...params.header};
  if (params.url.includes("/my/")) {
    // 拼接header 带上token
    header["Authorization"] = wx.getStorageSync("token");
  }

  // 每调用一次请求方法 ajaxTimes ++
  ajaxTimes++;

  // 增加 正在加载中 的效果
  wx.showLoading({
    title: "努力加载中",
    mask: true
  });

  const baseUrl = "https://api-hmugo-web.itheima.net/api/public/v1";
  return new Promise((resolve,reject) => {
    wx.request({
      ...params,  //解构  展开运算符
      header: header, //请求头
      url:baseUrl + params.url,
      success: (result) => {
        resolve(result.data.message);
      },
      fail: (err) => {
        reject(err);
      },
      complete: () => {
        ajaxTimes--;
        if (ajaxTimes == 0) {
          // 关闭加载中效果
          wx.hideLoading();
        }
      }
    });
  })
}