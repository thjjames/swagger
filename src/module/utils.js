// 注册模块方法名到实例中 用于记录模块是否注册和注册选项
export function registerModule(module, options = {}) {
  if (module.name !== 'ErrorModule' && this.defaults._moduleMap?.ErrorModule) {
    console.warn('any module needs to be registered before ErrorModule, otherwise module like RefreshTokenModule would be invalid!!!');
  }
  (this.defaults._moduleMap ??= {})[module.name] = options;
}

// 启用点表示法获取对象的值
export function getObjectValueAllowDot(obj, key) {
  return key.split('.').reduce((acc, cur) => {
    if (acc) return acc[cur];
  }, obj);
  // const array = key.split('.');
  // while (obj && array.length) {
  //   obj = obj[array.shift()];
  // }
  // return obj;
}

// 针对responseType: 'blob'失败的情况 判断blob类型是否可以转为对象类型的错误信息
export async function handleErrorBlob(response) {
  const { data } = response;
  if (!isBlob(data)) return;

  const result = await new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(this.result);
    };
    fileReader.readAsText(data);
  });

  try {
    response.data = JSON.parse(result);
    return response;
  } catch (e) {
    return response;
  }
}

const _toString = Object.prototype.toString;
const isType = function(type) {
  return function(obj) {
    return _toString.call(obj) === `[object ${type}]`;
  };
};
export const isObject = isType('Object');
export const isBlob = isType('Blob');
