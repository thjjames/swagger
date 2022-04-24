import { noop, registerModule } from './utils';

/**
 * @param isShowLoading 全局变量: 是否显示加载状态
 * @param showLoadingHandler 展示加载方法
 * @param hideLoadingHandler 隐藏加载方法
 */
const LoadingModule = function(options = {}) {
  registerModule.call(this, 'LoadingModule');
  const { isShowLoading, showLoadingHandler = noop, hideLoadingHandler = noop } = options;

  // 正在展示loading的请求数
  let loadingCount = 0;
  const tryShowLoading = () => {
    if (loadingCount === 0) {
      showLoadingHandler();
    }
    loadingCount++;
  };
  const tryHideLoading = () => {
    if (loadingCount <= 0) {
      return;
    }

    loadingCount--;
    if (loadingCount === 0) {
      hideLoadingHandler();
    }
  };

  this.interceptors.request.use(config => {
    if (isShowLoading || config.isShowLoading) {
      tryShowLoading();
    }
    return config;
  }, error => {
    if (isShowLoading || error.config?.isShowLoading) {
      tryHideLoading();
    }
    return Promise.reject(error);
  });

  this.interceptors.response.use(response => {
    if (isShowLoading || response.config?.isShowLoading) {
      tryHideLoading();
    }
    return response;
  }, error => {
    if (isShowLoading || error.config?.isShowLoading) {
      tryHideLoading();
    }
    return Promise.reject(error);
  });

  return this;
};
export default LoadingModule;
