/**
 * @param isShowLoading 全局变量: 是否显示加载状态
 * @param showLoadingHandler 展示加载方法
 * @param hideLoadingHandler 隐藏加载方法
 */
const LoadingModule = function(options = {}) {
  const { isShowLoading, showLoadingHandler = noop, hideLoadingHandler = noop } = options;

  const getShowLoading = config => {
    if (config?.isShowLoading !== void 0) return config.isShowLoading;
    return isShowLoading;
  };

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
    if (getShowLoading(config)) {
      tryShowLoading();
    }
    return config;
  }, error => {
    if (getShowLoading(error.config)) {
      tryHideLoading();
    }
    return Promise.reject(error);
  });

  this.interceptors.response.use(response => {
    if (getShowLoading(response.config)) {
      tryHideLoading();
    }
    return response;
  }, error => {
    if (getShowLoading(error.config)) {
      tryHideLoading();
    }
    return Promise.reject(error);
  });

  return this;
};
export default LoadingModule;
