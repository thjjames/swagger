import { AxiosError, isAxiosError } from 'axios';
import { getObjectValueAllowDot } from './utils';

/**
 * @param isUseCache 局部变量: 是否使用缓存
 * @param cacheKeys 全局/局部变量: 缓存配置键值组 每个键值都支持params.id格式
 * @param cachePeriod 全局/局部变量: 缓存时间 单位: d | h | m
 */
const CacheModule = function(options = {}) {
  const CACHE_KEYS = ['url'];
  const CACHE_PERIOD = '1d';
  const { cacheKeys = CACHE_KEYS, cachePeriod = CACHE_PERIOD } = options;

  const getCacheKeys = config => {
    const _cacheKeys = config?.cacheKeys || cacheKeys;

    if (!Array.isArray(_cacheKeys) || _cacheKeys.some(key => typeof key !== 'string')) {
      console.error('param cacheKeys must be String[]');
      return CACHE_KEYS;
    }
    return _cacheKeys;
  };
  const getCachePeriod = config => {
    let _cachePeriod = config?.cachePeriod || cachePeriod;

    const reg = /^(\d{1,2})([dhm])$/i;
    if (!reg.test(_cachePeriod)) {
      console.error('param cachePeriod is not valid');
      _cachePeriod = CACHE_PERIOD;
    }

    const m = 1e3 * 60;
    const h = m * 60;
    const d = h * 24;
    const cachePeriodMap = { m, h, d };
  
    const [, num, unit] = _cachePeriod.match(reg);
    return num * cachePeriodMap[unit.toLowerCase()];
  };

  const getRequestKey = config => {
    const _cacheKeys = getCacheKeys(config);
    return _cacheKeys.map(key => {
      const value = getObjectValueAllowDot(config, key);
      return JSON.stringify(value);
    }).join('|');
  };

  this.interceptors.request.use(config => {
    // config.data has been changed in transformRequest
    // see https://github.com/axios/axios/issues/1386
    config._data = config.data;

    if (config.isUseCache) {
      const key = getRequestKey(config);

      let cache;
      try {
        cache = JSON.parse(sessionStorage.getItem(key));
      } catch (e) {
        console.error(`cache ${key} parsed failed:`, e);
      }

      if (cache?.expires > Date.now()) {
        return Promise.reject(
          new AxiosError('', 'ERR_CACHE_MODULE', config, cache.response.request, cache.response)
        );
      }
    }
    return config;
  });

  this.interceptors.response.use(response => {
    const { config } = response;
    config.data = config._data;
    const key = getRequestKey(config);
    const cache = JSON.stringify({
      expires: Date.now() + getCachePeriod(config),
      response,
    });
    sessionStorage.setItem(key, cache);
    return response;
  }, error => {
    const { response } = error;
    if (isAxiosError(error) && error.code === 'ERR_CACHE_MODULE') {
      return Promise.resolve(response);
    }
    return Promise.reject(error);
  });

  return this;
};
export default CacheModule;
