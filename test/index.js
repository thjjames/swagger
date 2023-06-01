import Vue from 'vue';
import { Message, Loading } from 'element-ui';
import Swagger, { RefreshTokenModule, LoadingModule, RaceModule, ErrorModule } from '../src';

const swagger = Swagger.create({
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
}).use(RaceModule, {
  isAllowRace: true,
}).use(ErrorModule, {
  codeKey: 'status',
  successfulCode: 0,
  toastHandler: Message.error
});

new Vue({
  el: '#app',
  methods: {
    get() {
      swagger.get('/request').then(res => {
        console.log('get then', res);
      }).catch(err => {
        console.log('get catch', err);
      });
    },
    post() {
      swagger.post('/request', {
        method: 'POST',
        url: 'https://getman.cn/echo'
      }).then(res => {
        console.log('post then', res);
      }).catch(err => {
        console.log('post catch', err);
      });
    },
    postFail() {
      swagger.post('/request', {
        method: 'POST',
        url: ''
      }).then(res => {
        console.log('postFail then', res);
      }).catch(err => {
        console.log('postFail catch', err);
      });
    },
    $get() {
      swagger.$get('/request').then(res => {
        console.log('$get then', res);
      }).catch(err => {
        console.log('$get catch', err);
      });
    },
    $post() {
      swagger.$post('/request', {
        method: 'POST',
        url: 'https://getman.cn/echo'
      }).then(res => {
        console.log('$post then', res);
      }).catch(err => {
        console.log('$post catch', err);
      });
    },
    $postFail() {
      swagger.$post('/request', {
        method: 'POST',
        url: ''
      }).then(res => {
        console.log('$postFail then', res);
      }).catch(err => {
        console.log('$postFail catch', err);
      });
    },
    asyncMulti() {
      swagger.$get('/request').then(res => {
        console.log('async1 then', res);
      }).catch(err => {
        console.log('async1 catch', err);
      });
      setTimeout(() => {
        swagger.$get('/request').then(res => {
          console.log('async2 then', res);
        }).catch(err => {
          console.log('async2 catch', err);
        });
      });
    },
    async syncMulti() {
      await swagger.$get('/request').then(res => {
        console.log('sync1 then', res);
      }).catch(err => {
        console.log('sync1 catch', err);
      });
      swagger.$get('/request?query=1').then(res => {
        console.log('sync2 then', res);
      }).catch(err => {
        console.log('sync2 catch', err);
      });
    },
  }
});
