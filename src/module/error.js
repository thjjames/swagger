import { registerModule, isNumber, isObject } from './utils';

/**
 * @param codeKey 返回数据code键名: 默认'code'
 * @param successfulCode 成功码: 默认200
 * @param unauthorizedCode 未授权码: 默认401
 * @param noPermissionCode 无权限码: 默认403
 * @param unauthorizedHandler 未授权处理方法 使用此方法时需要将RefreshTokenModule执行在ErrorModule之前
 * @param noPermissionHandler 无权限处理方法
 * @param toastHandler toast提示实例方法 若不存在则由业务自行处理
 */
const ErrorModule = function(options = {}) {
  registerModule.call(this, 'ErrorModule');
  const codeKey = options.codeKey || 'code';
  const successfulCode = isNumber(options.successfulCode) ? options.successfulCode : 200; // fix value 0
  const unauthorizedCode = options.unauthorizedCode || 401;
  const noPermissionCode = options.noPermissionCode || 403;
  const unauthorizedHandler = options.unauthorizedHandler || noop;
  const noPermissionHandler = options.noPermissionHandler || noop;
  const toastHandler = options.toastHandler;
  this.interceptors.response.use(response => {
    // 根据后端返回来处理
    const { data, config } = response;
    const code = data[codeKey];
    const message = data.message;
    const isIgnoreToast = config.isIgnoreToast;
    // 兼容data为blob等文件格式
    if (code === successfulCode || !isObject(data)) {
      return response;
    } else {
      if (code === unauthorizedCode) {
        // 授权失败 unauthorizedHandler
        unauthorizedHandler();
      } else if (code === noPermissionCode) {
        // 无权限 noPermissionHandler
        noPermissionHandler();
      }
      toastHandler && !isIgnoreToast && toastHandler(message);
      response.message = message;
      return Promise.reject(response);
    }
  }, error => {
    // 请求失败处理 axios.enhanceError
    const { message, config } = error;
    const isIgnoreToast = config.isIgnoreToast;
    toastHandler && !isIgnoreToast && toastHandler(message);
    return Promise.reject(error);
  });

  return this;
};
export default ErrorModule;
