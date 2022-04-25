import Vue from 'vue';
import { Message, Loading } from 'element-ui';
import SwaggerApi, { RefreshTokenModule, LoadingModule, ErrorModule } from '../src';

const swagger = SwaggerApi.create({
  baseURL: '/api'
});
let loadingInstance = {}
swagger.use(RefreshTokenModule).use(LoadingModule, {
  isShowLoading: true,
  showLoadingHandler: () => {
    loadingInstance = Loading.service();
  },
  hideLoadingHandler: () => {
    loadingInstance.close();
  }
}).use(ErrorModule, {
  codeKey: 'status',
  successfulCode: 0,
  toastHandler: Message.error
});

new Vue({
  el: '#app',
  methods: {
    get() {
      swagger.$get('/request');
    },
    post() {
      swagger.$post('/request', {
        method: 'POST',
        url: 'https://getman.cn/echo'
      });
    },
    getMulti() {
      swagger.$get('/request').then(res => {
        console.log('res1', res);
      }).catch(err => {
        console.log('err1', err);
      });
      swagger.$get('/request?query=1').then(res => {
        console.log('res2', res);
      }).catch(err => {
        console.log('err2', err);
      });
    },
    postFail() {
      swagger.$post('/request', {
        method: 'POST',
        url: ''
      });
    }
  }
});
