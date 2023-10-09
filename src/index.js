import { Axios, mergeConfig, CancelToken, isCancel } from 'axios';
import defaultConfig from 'axios/unsafe/defaults'; // why axios/unsafe/defaults not axios/lib/defaults, see axios/package.json's exports
import { RefreshTokenModule, LoadingModule, RaceModule, ErrorModule } from './module';
import { registerModule, isObject } from './module/utils';

const getInnerData = res => {
  return isObject(res.data) ? res.data.data : res.data;
};

class Swagger extends Axios {
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
    return new Swagger(mergeConfig(defaultConfig, instanceConfig));

    /* // compatible with usage axios(config)
    const context = new Swagger(mergeConfig(defaultConfig, instanceConfig));
    const instance = Swagger.prototype.request.bind(context);

    // all the Class.prototype is nonenumerable in ES6 rules
    for (const property of Object.getOwnPropertyNames(Swagger.prototype)) {
      if (property === 'constructor') continue;
      Object.defineProperty(Swagger.prototype, property, {
        enumerable: true
      });
    }

    Object.assign(instance, Object.getPrototypeOf(Swagger.prototype), Swagger.prototype, context);
    return instance; */
  };

  // only effective in ES5.require
  // static RefreshTokenModule = RefreshTokenModule;
  // static LoadingModule = LoadingModule;
  // static RaceModule = RaceModule;
  // static ErrorModule = ErrorModule;
  // static CancelToken = CancelToken;
  // static isCancel = isCancel;
}

export {
  // Expose Modules
  RefreshTokenModule,
  LoadingModule,
  RaceModule,
  ErrorModule,
  // Expose CancelToken & isCancel
  CancelToken,
  isCancel
};
export default Swagger;
