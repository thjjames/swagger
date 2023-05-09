import axios from 'axios';
import merge from 'lodash.merge';
import defaultConfig from 'axios/lib/defaults';
import { RefreshTokenModule, LoadingModule, RaceModule, ErrorModule } from './module';
import { registerModule, isObject } from './module/utils';

const getInnerData = res => {
  return isObject(res.data) ? res.data.data : res.data;
};

class SwaggerApi extends axios.Axios {
  // constructor() {
  //   super(...arguments);
  // }

  /**
   * use extend module
   * @param module (RefreshTokenModule | LoadingModule | RaceModule | ErrorModule)
   * @param options
   */
  use(module, options) {
    registerModule.call(this, module.name);
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
    return new SwaggerApi(merge({ ...defaultConfig }, instanceConfig));

    /* // compatible with usage axios(config)
    const context = new SwaggerApi(merge({ ...defaultConfig }, instanceConfig));
    const instance = SwaggerApi.prototype.request.bind(context);

    // all the Class.prototype is nonenumerable in ES6 rules
    for (const property of Object.getOwnPropertyNames(SwaggerApi.prototype)) {
      if (property === 'constructor') continue;
      Object.defineProperty(SwaggerApi.prototype, property, {
        enumerable: true
      });
    }

    Object.assign(instance, Object.getPrototypeOf(SwaggerApi.prototype), SwaggerApi.prototype, context);
    return instance; */
  };

  // Expose Module
  static RefreshTokenModule = RefreshTokenModule;
  static LoadingModule = LoadingModule;
  static RaceModule = RaceModule;
  static ErrorModule = ErrorModule;

  // Expose Cancel & CancelToken
  static Cancel = axios.Cancel;
  static CancelToken = axios.CancelToken;
  static isCancel = axios.isCancel;
};

export { RefreshTokenModule, LoadingModule, RaceModule, ErrorModule }; // not effective for build, only for local test
export default SwaggerApi;
