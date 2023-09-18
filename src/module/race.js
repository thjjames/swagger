import { CancelToken } from 'axios';
import { getObjectValueAllowDot } from './utils';

/**
 * 不同于axios.race 这里的race表示另类的请求竞态 当后一个同类型请求发起时 取消前一个未完成请求
 * @param isAllowRace 全局/局部变量: 是否允许竞态
 * @param raceKeys 全局/局部变量: 竞态配置键值组 每个键值都支持params.id格式
 * @param racePosition 全局/局部变量: 竞态取消位置 默认'former' 取消先发起的同类请求
 */
const RaceModule = function(options = {}) {
  const RACE_KEYS = ['url'];
  const { isAllowRace, raceKeys = RACE_KEYS, racePosition = 'former' } = options;
  
  const requestMap = new Map();

  const getAllowRace = config => {
    if (config?.isAllowRace !== void 0) return config.isAllowRace;
    return isAllowRace;
  };
  const getRaceKeys = config => {
    const _raceKeys = config?.raceKeys || raceKeys;

    if (!Array.isArray(_raceKeys) || _raceKeys.some(key => typeof key !== 'string')) {
      console.error('param raceKeys must be String[]');
      return RACE_KEYS;
    }
    return _raceKeys;
  };
  const getRacePosition = config => {
    return config?.racePosition || racePosition;
  };

  const getRequestKey = config => {
    const _raceKeys = getRaceKeys(config);
    return _raceKeys.map(key => {
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
    // todo: CancelToken is deprecated since axios v0.22.0, would be replaced with AbortController in future
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
