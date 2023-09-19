# SWAGGER
通用请求库swagger 基于axios@1扩展 使用此库后可以不用安装axios  
![](https://raw.githubusercontent.com/thjjames/swagger/master/swagger-framework.png)

## 使用说明
```bash
npm i -S github:thjjames/swagger
```
或  
`package.json`中`dependencies`添加
```
"swagger": "git@github.com:thjjames/swagger"
```

## 基础用法
```js
import Swagger, { RefreshTokenModule, LoadingModule, RaceModule, ErrorModule } from 'swagger'

// Swagger.create suggested but not new keyword, cause param defaults would be lost
const swagger = Swagger.create({
  baseURL: 'https://getman.cn/api'
})
swagger.use(RefreshTokenModule).use(ErrorModule)
Vue.prototype.$swagger = swagger
this.$swagger.$get('/request').then(res => {})
```

### 方法

#### create(创建新实例)
> 所有实例均由静态方法create生成，这里舍弃了`axios(config)`的写法

> 参考 https://github.com/axios/axios#creating-an-instance

```js
const swagger = Swagger.create({
  baseURL: 'https://getman.cn/api' // 请求基本域名
})
```

#### use(使用扩展模块)
```js
swagger.use(module, options)
```

##### 拦截器执行顺序
参考 [axios.interceptors.use](https://github.com/axios/axios#multiple-interceptors) 的执行顺序 为反洋葱模型
```js
swagger.use(LoadingModule).use(RaceModule)
```
模块中的实际执行顺序为：
```
RaceModule.request-interceptor
      ↓ ↓ ↓
LoadingModule.request-interceptor
      ↓ ↓ ↓
ajax(config)
      ↓ ↓ ↓
LoadingModule.response-interceptor
      ↓ ↓ ↓
RaceModule.response-interceptor
```

### 扩展模块

#### refreshTokenModule
```js
import { RefreshTokenModule } from 'swagger'

swagger.use(RefreshTokenModule, {
  unauthorizedCode: 401,
  getRefreshToken() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| codeKey | 后端返回data数据中code键名 | _string_ | `code` |
| unauthorizedCode | 未授权码 | _number_ | `401` |
| maxRetryTimes | 最大重试次数 | _number_ | `1` |
| getRefreshToken | 获取新token方法 | _function():Promise_ | 内置业务方法，一般不通用需要根据实际业务传入 |

#### loadingModule
```js
import { LoadingModule } from 'swagger'
import { Loading } from 'element-ui'

let loadingInstance = {}
swagger.use(LoadingModule, {
  isShowLoading: true,
  showLoadingHandler: () => {
    loadingInstance = Loading.service();
  },
  hideLoadingHandler: () => {
    loadingInstance.close();
  }
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isShowLoading | 是否显示加载状态，可以通过request.config设置单个请求 | _boolean_ | `false` |
| showLoadingHandler | 展示加载方法 | _function_ | - |
| hideLoadingHandler | 隐藏加载方法 | _function_ | - |

#### raceModule
```js
import { RaceModule } from 'swagger'

swagger.use(RaceModule, {
  isAllowRace: true
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isAllowRace | 是否允许竞态，可以通过request.config设置单个请求 | _boolean_ | `false` |
| raceKeys | 竞态键值组，键值支持点表示法，可以通过request.config设置单个请求 | _array&lt;string&gt;_ | `['url']` |
| racePosition | 竞态位置，指定被取消的请求位置，可以通过request.config设置单个请求 | _'former' &#124; 'latter'_ | `former` |

#### errorModule
> Tips: errorModule需要被注册在最后，否则会影响其他模块的使用！
```js
import { ErrorModule } from 'swagger'
import { Message } from 'element-ui'
import router from '@/router'

swagger.use(ErrorModule, {
  successfulCode: 0,
  forbiddenCode: 403,
  forbiddenHandler() {
    setTimeout(() => {
      router.push({ name: '403' });
    })
  },
  toastHandler: Message.error
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| codeKey | 后端返回data数据中code键名 | _string_ | `code` |
| messageKey | 后端返回data数据中message键名 | _string_ | `message` |
| successfulCode | 成功码 | _number_ | `0` |
| unauthorizedCode | 未授权码 | _number_ | `401` |
| forbiddenCode | 无权限码 | _number_ | `403` |
| unauthorizedHandler | 未授权处理方法 | _function(response)_ | - |
| forbiddenHandler | 无权限处理方法 | _function(response)_ | - |
| serviceErrorHandler | 业务错误码处理方法，已排除未授权、无权限 | _function(response)_ | - |
| statusErrorHandler | 状态错误码处理方法 | _function(response)_ | - |
| toastHandler | 提示实例方法，可以选择不传由业务触发 | _function_ | - |

#### 自定义模块CustomizedModule
除了上述提供的通用模块外，也可以在项目中自由定义任何模块 _module_，用以抽离繁复的 _interceptors.request_ 或 _interceptors.response_ 里的逻辑，方式很简单：
```js
// module.js
export const CustomizedModule = function(options = {}) {
  this.interceptors.request.use(config => {
    // ur customized code
    return config
  }, error => {
    // ur customized code
    return Promise.reject(error)
  })
  this.interceptors.response.use(response => {
    // ur customized code
    return response
  }, error => {
    // ur customized code
    return Promise.reject(error)
  })
}

// axios.js
swagger.use(CustomizedModule)
```

## 请求配置
> 参考 <a href="https://github.com/axios/axios#request-config" target="_blank">https://github.com/axios/axios#request-config</a>

目前 `swagger` 支持的自定义配置有：
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isShowLoading | 是否显示加载状态，可以覆盖loadingModule的全局值 | _boolean_ | `false` |
| isAllowRace | 是否允许竞态，可以覆盖raceModule的全局值 | _boolean_ | `false` |
| raceKeys | 竞态键值组，可以覆盖raceModule的全局值 | _array&lt;string&gt;_ | - |
| racePosition | 竞态位置，可以覆盖raceModule的全局值 | _'former' &#124; 'latter'_ | - |
| isIgnoreToast | 是否忽略提示，用来定制toastHandler作用下的特殊情况 | _boolean_ | `false` |

## 语法糖
axios正常返回数据格式为
```js
{
  // the response that was provided by the server
  data: {
    code: 200,
    message: '',
    data: {}
  },
  // the HTTP status code from the server response
  status: 200,
  // the HTTP status message from the server response
  statusText: 'OK',
  // the HTTP headers that the server responded with All header names are lowercase and can be accessed using the bracket notation.
  // Example: `response.headers['content-type']`
  headers: {},
  // the config that was provided to `axios` for the request
  config: {},
  // the request that generated this response
  request: {}
}
```
语法糖可以帮助直接返回最里层data数据
### $get
```js
this.$swagger.$get(url, config)
```
### $post
```js
this.$swagger.$post(url, data, config)
```

## contributor
[James Tian](<https://github.com/thjjames>) <img width="32" src="https://avatars1.githubusercontent.com/u/8946788?s=400&u=74db1b1c5254cc5980c851f6625f445f73cb0a19&v=4" />

## feedback
please create issues on https://github.com/thjjames/swagger/issues or send an email on <thjjames@163.com>
