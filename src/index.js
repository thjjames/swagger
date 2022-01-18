import axios from 'axios';
import merge from 'lodash.merge';
import defaultConfig from 'axios/lib/defaults';
import { RefreshTokenModule, LoadingModule, ErrorModule } from './module';

class SwaggerApi extends axios.Axios {
  constructor() {
    super(...arguments);
  }

  /**
   * use extend module
   * @param module (RefreshTokenModule | LoadingModule | ErrorModule)
   * @param options
   */
  use(module, options) {
    return module.call(this, options);
  }
  // Grammar Sugar
  $get(url, config) {
    return this.get(url, config).then(res => res?.data?.data);
  }
  $post(url, data, config) {
    return this.post(url, data, config).then(res => res?.data?.data);
  }

  // Factory for creating new instances
  static create = function(instanceConfig) {
    return new SwaggerApi(merge(defaultConfig, instanceConfig));
  };

  // Expose Module
  static RefreshTokenModule = RefreshTokenModule;
  static LoadingModule = LoadingModule;
  static ErrorModule = ErrorModule;

  // Expose Cancel & CancelToken
  static Cancel = import('axios/lib/cancel/Cancel');
  static CancelToken = import('axios/lib/cancel/CancelToken');
  static isCancel = import('axios/lib/cancel/isCancel');
};

export { RefreshTokenModule, LoadingModule, ErrorModule };
export default SwaggerApi;
