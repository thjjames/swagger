export const noop = () => void 0;

// 注册模块方法名到实例中 用于记录模块是否注册和注册顺序
export function registerModule(moduleName) {
  if (moduleName === 'RefreshTokenModule' && this.defaults._moduleList?.includes('ErrorModule')) {
    console.warn('RefreshTokenModule needs to be registered before ErrorModule.');
  }
  this.defaults._moduleList = [...(this.defaults._moduleList || []), moduleName];
};