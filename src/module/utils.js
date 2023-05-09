// 注册模块方法名到实例中 用于记录模块是否注册和注册顺序
export function registerModule(moduleName) {
  if (moduleName !== 'ErrorModule' && this.defaults._moduleList?.includes('ErrorModule')) {
    console.warn('any module needs to be registered before ErrorModule, otherwise module like RefreshTokenModule would be invalid!!!');
  }
  this.defaults._moduleList = [...(this.defaults._moduleList || []), moduleName];
};

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
};

const _toString = Object.prototype.toString;
const isType = function(type) {
  return function(obj) {
    return _toString.call(obj) === `[object ${type}]`;
  }
}
export const isNumber = isType('Number');
export const isObject = isType('Object');
export const isBlob = isType('Blob');
