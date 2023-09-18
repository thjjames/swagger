import { CancelToken } from 'axios';
import { getObjectValueAllowDot } from './utils';

/**
 * 不同于axios.race 这里的race表示另类的请求竞态 当后一个同类型请求发起时 取消前一个未完成请求
 * @param isAllowRace 全局/局部变量: 是否允许竞态
 * @param raceConfigs 全局/局部变量: 竞态参数 支持params.id格式
 * @param racePosition 全局/局部变量: 竞态取消位置 默认'former' 取消先发起的同类请求
 */
const RaceModule = function(options = {}) {
  const RACE_CONFIGS = ['url'];
  const { isAllowRace, raceConfigs = RACE_CONFIGS, racePosition = 'former' } = options;
  
  const requestMap = new Map();

  const getAllowRace = config => {
    if (config?.isAllowRace !== void 0) return config.isAllowRace;
    return isAllowRace;
  };
  const getRaceConfigs = config => {
    const _raceConfigs = config?.raceConfigs || raceConfigs;

    if (!Array.isArray(_raceConfigs) || _raceConfigs.some(key => typeof key !== 'string')) {
      console.error('param raceConfigs must be String[]');
      return RACE_CONFIGS;
    }
    return _raceConfigs;
  };
  const getRacePosition = config => {
    return config?.racePosition || racePosition;
  };

  const getRequestKey = config => {
    const _raceConfigs = getRaceConfigs(config);
    return _raceConfigs.map(key => {
      let value = getObjectValueAllowDot(config, key);
      switch (key) {
        case 'params':
        case 'data':
          // value = qs.stringify(value, { encode: false });
          value = new URLSearchParams(value).toString();
          break;
      }
      return value;
    }).join('|');
  };
  const setRequestMap = config => {
    const key = getRequestKey(config);
    const position = getRacePosition(config);
    const source = CancelToken.source();
    config.cancelToken = source.token;

    if (requestMap.has(key)) {
      const cancelTip = `request ${key} canceled by RaceModule`;
      if (position === 'former') {
        requestMap.get(key).cancel(cancelTip);
        requestMap.set(key, source);
      } else {
        source.cancel(cancelTip);
      }
    } else {
      requestMap.set(key, source);
    }
  };
  const deleteRequestMap = config => {
    if (!config || !getAllowRace(config)) return;

    const key = getRequestKey(config);
    requestMap.delete(key);
  };

  this.interceptors.request.use(config => {
    if (getAllowRace(config)) {
      setRequestMap(config);
    }
    return config;
  }, error => {
    deleteRequestMap(error.config);
    return Promise.reject(error);
  });

  this.interceptors.response.use(response => {
    deleteRequestMap(response.config);
    return response;
  }, error => {
    deleteRequestMap(error.config);
    return Promise.reject(error);
  });

  return this;
};
export default RaceModule;
