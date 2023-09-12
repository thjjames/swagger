/**
 * @param codeKey 返回数据code键名: 默认'code'
 * @param unauthorizedCode 未授权码: 默认401
 * @param maxRetryTimes 最大重试次数
 * @param getRefreshToken 获取新token方法
 */
const RefreshTokenModule = function(options = {}) {
  const codeKey = options.codeKey || 'code';
  const unauthorizedCode = options.unauthorizedCode || 401;
  const maxRetryTimes = options.maxRetryTimes || 1;
  const getRefreshToken = options.getRefreshToken || (async () => {
    const ua = navigator.userAgent;
    const isInApp = ua.includes('iPhone') || ua.includes('Android');
    let token;
    token = new URLSearchParams(location.search || location.hash.slice(1)).get('token');
    if (token) return token;

    if (isInApp) {
      token = await $native.getToken().catch(noop);
    } else {
      token = await $swagger.getToken().catch(noop);
    }
    return token;
  });

  // 是否正在刷新token
  let isRefreshingToken = false;
  // 并发请求栈
  let concurrentRequestStack = [];
  // 拦截器中通用代码
  const refreshTokenHandler = async response => {
    // 超过最大重试次数 抛出异常 避免死循环
    const { config } = response;
    if (config._retryTimes === undefined) {
      config._retryTimes = 0;
    }
    config._retryTimes++;
    if (config._retryTimes > maxRetryTimes) return Promise.resolve(response);

    if (isRefreshingToken) {
      // 这里需要返回Promise链来保证栈里请求执行后完成闭环！
      return new Promise((resolve, reject) => {
        concurrentRequestStack.push(
          () => {
            this.request(config).then(resolve, reject);
          }
        );
      });
    } else {
      isRefreshingToken = true;
      const token = await getRefreshToken();
      isRefreshingToken = false;
      if (!token) {
        // 获取新token失败 直接抛出原异常
        // Q: 关于这里为什么用resolve而非reject？
        // A: RefreshTokenModule只是单纯的重试机制模块 并不改变成功或失败状态 保证Promise链还是fulfilled 也方便后续ErrorModule统一判断
        return Promise.resolve(response);
      } else {
        // update current request & instance's header's Authorization info
        config.headers.Authorization = `Bearer ${token}`;
        this.defaults.headers.common.Authorization = `Bearer ${token}`;

        setTimeout(() => {
          if (concurrentRequestStack.length) {
            concurrentRequestStack.forEach(fn => fn?.());
            concurrentRequestStack = [];
          }
        });

        // 重新发起请求
        return this.request(config);
      }
    }
  };

  this.interceptors.response.use(response => {
    if (response.data[codeKey] !== unauthorizedCode) return response;
    return refreshTokenHandler(response);
  });

  return this;
};
export default RefreshTokenModule;
