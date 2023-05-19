import axios from 'axios';
import qs from 'qs';
import { getObjectValueAllowDot } from './utils';

/**
 * 不同于axios.race 这里的race表示另类的请求竞态 当后一个同类型请求发起时 取消前一个未完成请求
 * @param isAllowRace 全局全局/局部变量: 是否允许竞态
 * @param raceConfigs 同类型竞态参数 支持params.id格式
 */
const RaceModule = function(options = {}) {
  const { isAllowRace, raceConfigs = ['url'] } = options;

  if (!Array.isArray(raceConfigs) || raceConfigs.some(key => typeof key !== 'string')) {
    console.error('param raceConfigs must be String[]');
    return this;
  }
  
  const requestMap = new Map();
  const getAllowRace = config => {
    if (config?.isAllowRace !== void 0) return config.isAllowRace;
    return isAllowRace;
  };
  const getRequestKey = config => {
    return raceConfigs.map(key => {
      let value = getObjectValueAllowDot(config, key);
      switch (key) {
        case 'params':
        case 'data':
          value = qs.stringify(value);
          break;
      }
      return value;
    }).join('|');
  };
  const deleteRequestMap = config => {
    if (!config || !getAllowRace(config)) return;

    const key = getRequestKey(config);
    requestMap.delete(key);
  };

  this.interceptors.request.use(config => {
    if (getAllowRace(config)) {
      const key = getRequestKey(config);
      if (requestMap.has(key)) {
        requestMap.get(key).cancel(`request ${key} canceled by RaceModule`);
      }

      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      requestMap.set(key, source);
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
