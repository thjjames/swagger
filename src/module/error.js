import { isCancel } from 'axios';
import { handleErrorBlob, isObject } from './utils';

/**
 * @param codeKey 返回数据code键名: 默认'code'
 * @param successfulCode 成功码: 默认0
 * @param unauthorizedCode 未授权码: 默认401
 * @param forbiddenCode 无权限码: 默认403
 * @param unauthorizedHandler 未授权处理方法 使用此方法时需要将RefreshTokenModule执行在ErrorModule之前
 * @param forbiddenHandler 无权限处理方法
 * @param serviceErrorHandler 业务错误码处理方法(exclude unauthorizedCode & forbiddenCode)
 * @param statusErrorHandler 状态错误码处理方法
 * @param toastHandler toast提示实例方法 若不存在则由业务自行处理
 */
const ErrorModule = function(options = {}) {
  const codeKey = options.codeKey || 'code';
  const messageKey = options.messageKey || 'message';
  const successfulCode = options.successfulCode || 0;
  const unauthorizedCode = options.unauthorizedCode || 401;
  const forbiddenCode = options.forbiddenCode || 403;
  const unauthorizedHandler = options.unauthorizedHandler || noop;
  const forbiddenHandler = options.forbiddenHandler || noop;
  const serviceErrorHandler = options.serviceErrorHandler || noop;
  const statusErrorHandler = options.statusErrorHandler || noop;
  const toastHandler = options.toastHandler;
  this.interceptors.response.use(async response => {
    // 处理data为blob类型时的失败情况
    await handleErrorBlob(response);
    // 根据后端返回来处理
    const { data, config } = response;
    const code = data[codeKey];
    const message = data[messageKey];
    // 兼容data为非对象类型时直接返回
    if (code === successfulCode || !isObject(data)) {
      return response;
    } else {
      if (code === unauthorizedCode) {
        // 授权失败
        await unauthorizedHandler(response);
      } else if (code === forbiddenCode) {
        // 无权限
        await forbiddenHandler(response);
      } else {
        // 剩余业务码错误
        const _response = await serviceErrorHandler(response);
        // 有特殊情况需要正常返回
        if (_response) return _response;
      }
      toastHandler && !config.isIgnoreToast && toastHandler(message);
      return Promise.reject(response);
    }
  }, async error => {
    // 主动取消的接口
    if (isCancel(error)) {
      return Promise.reject(error);
    }
    // 请求失败处理 axios.enhanceError
    const { message, config, response } = error;
    await statusErrorHandler(response);
    // 无需提示信息情况 1未提供提示方法 2配置
    toastHandler && !config.isIgnoreToast && toastHandler(message);
    return Promise.reject(error);
  });

  return this;
};
export default ErrorModule;
