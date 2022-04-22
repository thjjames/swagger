import { noop, registerModule } from './utils';

/**
 * @param unauthorizedCode 未授权码: 默认401
 * @param noPermissionCode 无权限码: 默认403
 * @param unauthorizedHandler 未授权处理方法 使用此方法时需要将RefreshTokenModule执行在ErrorModule之前
 * @param noPermissionHandler 无权限处理方法
 * @param toastHandler toast提示实例方法 若不存在则由业务自行处理
 */
const ErrorModule = function(options = {}) {
  registerModule.call(this, 'ErrorModule');
  const unauthorizedCode = options.unauthorizedCode || 401;
  const noPermissionCode = options.noPermissionCode || 403;
  const unauthorizedHandler = options.unauthorizedHandler || noop;
  const noPermissionHandler = options.noPermissionHandler || noop;
  const toastHandler = options.toastHandler;
  this.interceptors.response.use(response => {
    // 根据后端返回来处理
    const { code, message } = response.data;
    if (code === 200) {
      return response;
    } else {
      if (code === unauthorizedCode && !this.defaults._moduleList.includes('RefreshTokenModule')) {
        // 授权失败 unauthorizedHandler 不存在刷新token机制时才执行回调
        unauthorizedHandler();
      } else if (code === noPermissionCode) {
        // 无权限 noPermissionHandler
        noPermissionHandler();
      }
      toastHandler && toastHandler(message);
      response.message = message;
      return Promise.reject(response);
    }
  }, error => {
    // 请求失败处理 axios.enhanceError
    if (error.code === unauthorizedCode) {
      // RefreshTokenModule需要注册在前 失败后执行授权失败回调
      unauthorizedHandler();
    }
    toastHandler && toastHandler(error.message);
    return Promise.reject(error);
  });

  return this;
};
export default ErrorModule;
