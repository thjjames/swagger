import qs from 'qs';
import { registerModule } from './utils';

/**
 * @param unauthorizedCode 未授权码: 默认401
 * @param maxTryTimes 最大重试次数
 * @param getRefreshToken 获取新token方法
 */
const RefreshTokenModule = function(options = {}) {
  registerModule.call(this, 'RefreshTokenModule');
  const unauthorizedCode = options.unauthorizedCode || 401;
  const maxTryTimes = options.maxTryTimes || 1;
  const getRefreshToken = options.getRefreshToken || (async () => {
    const isInApp = navigator.userAgent.includes('longfor');
    let token;
    if (isInApp) {
      token = await $native.getToken().catch(() => {});
    } else {
      token = qs.parse(location.search, { ignoreQueryPrefix: true })?.token;
    }
    return token;
  });

  // 是否正在刷新token
  let isRefreshingToken = false;
  // 并发请求栈
  let concurrentRequestStack = [];
  // 拦截器中通用代码 @param => response in then | error in catch
  const refreshTokenHandler = async param => {
    // 超过最大重试次数 抛出异常 避免死循环
    const config = param.config;
    if (config._tryTimes === undefined) {
      config._tryTimes = 0;
    }
    config._tryTimes++;
    if (config._tryTimes > maxTryTimes) return Promise.reject(param);

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
        return Promise.reject(param);
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
    // 执行顺序早于ErrorModule的情况
    if (response.data.code !== unauthorizedCode) return response;

    // complement code & message if rejected
    response.code = unauthorizedCode;
    response.message = response.data.message;

    return refreshTokenHandler(response);
  }, error => {
    // 非授权失败错误 直接抛出原异常
    // if (error.code !== unauthorizedCode) return Promise.reject(error);

    return refreshTokenHandler(error);
  });

  return this;
};
export default RefreshTokenModule;
