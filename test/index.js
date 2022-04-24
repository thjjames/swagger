import SwaggerApi, { RefreshTokenModule, LoadingModule, ErrorModule } from '../src';

const instance = SwaggerApi.create({
  baseURL: '/api'
});
instance.use(RefreshTokenModule).use(LoadingModule).use(ErrorModule, {
  codeKey: 'status',
  codeValue: 0
});

document.getElementById('get').addEventListener('click', () => {
  instance.$get('/request').then(res => {
    console.log('res1', res);
  }).catch(err => {
    console.log('err1', err);
  });
  instance.$get('/request?query=1').then(res => {
    console.log('res2', res);
  }).catch(err => {
    console.log('err2', err);
  });
});
document.getElementById('post').addEventListener('click', () => {
  instance.$post('/request', { method: 'POST', url: 'https://getman.cn/echo' });
});
