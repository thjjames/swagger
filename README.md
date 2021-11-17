# SWAGGER-API
通用swagger-api请求库 基于axios扩展

## 使用说明
```bash
npm i -S @longfor/swagger
```

## 基础用法
```js
import SwaggerApi, { RefreshTokenModule, LoadingModule, ErrorModule } from '@longfor/swagger'

const swagger = new SwaggerApi({
  baseURL: 'https://getman.cn/api' // 请求基本域名
})
swagger.use(RefreshTokenModule).use(ErrorModule)
Vue.prototype.$swagger = swagger
this.$get('/request').then(res => {})
```

### API

#### create(创建新实例 see http://www.axios-js.com/zh-cn/docs/#)
```js
const api = SwaggerApi.create({
  baseURL: 'https://getman.cn/api' // 请求基本域名
})
```

#### use(使用扩展模块)
```js
api.use(module, options)
```

### module

#### refreshTokenModule
```js
import { RefreshTokenModule } from '@longfor/swagger'
api.use(RefreshTokenModule, {
  unauthorizedCode: 401,
  getRefreshToken() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| unauthorizedCode | 未授权码 | _string_ | `401` |
| maxTryTimes | 最大重试次数 | _string_ | `1` |
| getRefreshToken | 获取新token方法 | _function<Promise>_ | `内置业务获取方法` |

#### loadingModule
```js
import { LoadingModule } from '@longfor/swagger'
api.use(LoadingModule, {
  isShowLoading: true,
  showLoading() {},
  hideLoading() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isShowLoading | 是否显示加载状态，可以通过request.config设置单个请求 | _boolean_ | `false` |
| showLoading | 展示加载方法 | _function_ | - |
| hideLoading | 隐藏加载方法 | _function_ | - |

#### errorModule
```js
import { ErrorModule } from '@longfor/swagger'
api.use(ErrorModule, {
  unauthorizedCode: 401,
  unauthorizedHandler() {}
})
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| unauthorizedCode | 未授权码 | _string_ | `401` |
| noPermissionCode | 无权限码 | _string_ | `403` |
| unauthorizedHandler | 未授权处理方法，当ErrorModule注册在RefreshTokenModule之前时无效 | _function_ | - |
| noPermissionHandler | 无权限处理方法 | _function_ | - |
| toastInstance | 提示实例方法，可以不传，由业务触发 | _function_ | - |

## contributor
tianhaojun <thjjames@163.com>

## feadback
please create issues on https://github.com/thjjames or send an email on <thjjames@163.com>