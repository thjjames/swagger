# SWAGGER-API
通用swagger-api请求库 基于axios扩展 使用此库后可以不用安装axios  
![](https://github.com/thjjames/swagger-api/blob/master/swagger-api.png?raw=true)

## 使用说明
```bash
npm i -S @github.com:thjjames/swagger-api
```
或  
`package.json`中`dependencies`添加
```
"swagger-api": "git@github.com:thjjames/swagger-api"
```

## 基础用法
```js
import SwaggerApi, { RefreshTokenModule, LoadingModule, ErrorModule } from 'swagger-api'

// SwaggerApi.create suggested but not new keyword, cause param defaults would be lost
const swagger = SwaggerApi.create({
  baseURL: 'https://getman.cn/api'
})
swagger.use(RefreshTokenModule).use(ErrorModule)
Vue.prototype.$swagger = swagger
this.$swagger.$get('/request').then(res => {})
```

### 方法

#### create(创建新实例)
> 所有实例均由静态方法create生成，这里舍弃了`axios(config)`的写法

> 参考 http://www.axios-js.com/zh-cn/docs/#axios-create-config

```js
const swagger = SwaggerApi.create({
  baseURL: 'https://getman.cn/api' // 请求基本域名
})
```

#### use(使用扩展模块)
```js
swagger.use(module, options)
```

### 扩展模块

#### refreshTokenModule
```js
import { RefreshTokenModule } from 'swagger-api'
swagger.use(RefreshTokenModule, {
  unauthorizedCode: 401,
  getRefreshToken() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| codeKey | 后端返回data数据中code键名 | _string_ | `code` |
| unauthorizedCode | 未授权码 | _number_ | `401` |
| maxTryTimes | 最大重试次数 | _number_ | `1` |
| getRefreshToken | 获取新token方法 | _function&lt;Promise&gt;_ | `内置业务方法，一般不通用需要根据实际业务传入` |

#### loadingModule
```js
import { LoadingModule } from 'swagger-api'
swagger.use(LoadingModule, {
  isShowLoading: true,
  showLoadingHandler() {},
  hideLoadingHandler() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isShowLoading | 是否显示加载状态，可以通过request.config设置单个请求 | _boolean_ | `false` |
| showLoadingHandler | 展示加载方法 | _function_ | - |
| hideLoadingHandler | 隐藏加载方法 | _function_ | - |

#### errorModule
> Tips: errorModule需要被注册在最后，否则会影响其他模块的使用！
```js
import { ErrorModule } from 'swagger-api'
swagger.use(ErrorModule, {
  unauthorizedCode: 401,
  unauthorizedHandler() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| codeKey | 后端返回data数据中code键名 | _string_ | `code` |
| successfulCode | 成功码 | _number_ | `200` |
| unauthorizedCode | 未授权码 | _number_ | `401` |
| noPermissionCode | 无权限码 | _number_ | `403` |
| reservedErrorCode | 保留错误码 | _number_/_array_ | `-999` |
| unauthorizedHandler | 未授权处理方法 | _function_ | - |
| noPermissionHandler | 无权限处理方法 | _function_ | - |
| reservedErrorHandler | 保留错误码处理方法 | _function_ | - |
| toastHandler | 提示实例方法，可以选择不传由业务触发 | _function_ | - |

## 请求配置
> 参考 <a href="http://www.axios-js.com/zh-cn/docs/#请求配置" target="_blank">http://www.axios-js.com/zh-cn/docs/#请求配置</a>

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isShowLoading | 是否显示加载状态，可以覆盖loadingModule的全局值 | _boolean_ | `false` |
| isIgnoreToast | 是否忽略提示，用来定制toastHandler作用下的特殊情况 | _boolean_ | `false` |


## 语法糖
axios正常返回数据格式为
```js
{
  config: {},
  data: {
    code: 200,
    message: '',
    data: {}
  },
  headers: {},
  message: '',
  request: {},
  status: 200,
  statusText: 'OK'
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

## feadback
please create issues on https://github.com/thjjames/swagger-api/issues or send an email on <thjjames@163.com>
