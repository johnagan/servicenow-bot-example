const {SN_CLIENT_ID, SN_CLIENT_SECRET, SN_LOGIN, SN_PASSWORD, SN_DOMAIN} = process.env,
      baseURL = `https://${SN_DOMAIN}.service-now.com`,
      qs = require('querystring'),
      axios = require('axios');


function authorize() {
  let params = qs.stringify({
    grant_type: 'password',
    username: SN_LOGIN,
    password: SN_PASSWORD,
    client_id: SN_CLIENT_ID,
    client_secret: SN_CLIENT_SECRET
  });

  return axios.post(`${baseURL}/oauth_token.do`, params).catch(error).then(data).then(connection);
}

function connection(auth) {
  let instance = axios.create({
    baseURL: `https://${SN_DOMAIN}.service-now.com/`,
    headers: { Authorization: `Bearer ${auth.access_token}` }
  });

  return Promise.resolve(instance);
}

function data(res) {
  return Promise.resolve(res.data);
}

function result(res) {
  return Promise.resolve(res.data.result);
}

function error(res) {
  console.error(res.response.data);
  return Promise.resolve(res.response.data);
}

function get(table, params, id, conn) {
  return conn.get(`api/now/table/${table}/${id}`, {params}).then(result).catch(error);
}

function list(table, params, conn) {
  return conn.get(`api/now/table/${table}`, {params}).then(result).catch(error);
}

function post(table, record, conn) {
 return conn.post(`api/now/table/${table}?sysparm_display_value=all`, record).then(result).catch(error);
}

exports.search = (table, query) => {
  let params = { sysparm_display_value: 'all', sysparm_limit: 5, sysparm_query: query };
  return authorize().then(list.bind(null, table, params));
}

exports.get = (table, params, id) => {
  return authorize().then(get.bind(null, table, params, id));
}

exports.create = (table, record) => {
  return authorize().then(post.bind(null, table, record));
}

exports.baseURL = baseURL;