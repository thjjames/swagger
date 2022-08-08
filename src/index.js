import axios from 'axios';
import merge from 'lodash.merge';
import defaultConfig from 'axios/lib/defaults';
import { RefreshTokenModule, LoadingModule, ErrorModule } from './module';
import { isObject } from './module/utils';

const getInnerData = res => {
  return isObject(res.data) ? res.data.data : res.data;
};

class SwaggerApi extends axios.Axios {
  // constructor() {
  //   super(...arguments);
  // }

  /**
   * use extend module
   * @param module (RefreshTokenModule | LoadingModule | ErrorModule)
   * @param options
   */
  use(module, options) {
    return module.call(this, options);
  }

  // Syntactic Sugar
  $get(url, config) {
    return this.get(url, config).then(res => getInnerData(res));
  }
  $post(url, data, config) {
    return this.post(url, data, config).then(res => getInnerData(res));
  }

  // Factory for creating new instances
  static create = function(instanceConfig) {
    return new SwaggerApi(merge(defaultConfig, instanceConfig));

    // compatible with usage axios(config)
    // const context = new SwaggerApi(merge(defaultConfig, instanceConfig));
    // const instance = SwaggerApi.prototype.request.bind(context);

    // const ownProp = {};
    // for (const item of Object.getOwnPropertyNames(SwaggerApi.prototype)) {
    //   ownProp[item] = SwaggerApi.prototype[item];
    // }
    // Object.assign(instance, Object.getPrototypeOf(SwaggerApi.prototype), ownProp, context);
    // return instance;
  };

  // Expose Module
  static RefreshTokenModule = RefreshTokenModule;
  static LoadingModule = LoadingModule;
  static ErrorModule = ErrorModule;

  // Expose Cancel & CancelToken
  static Cancel = axios.Cancel;
  static CancelToken = axios.CancelToken;
  static isCancel = axios.isCancel;
};

export { RefreshTokenModule, LoadingModule, ErrorModule }; // not effective for build, only for local test
export default SwaggerApi;
