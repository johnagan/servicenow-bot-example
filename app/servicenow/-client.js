const { PORT, SN_CLIENT_ID, SN_CLIENT_SECRET, SN_DOMAIN, SN_CALLBACK_URL } = process.env
const baseURL = `https://${SN_DOMAIN}.service-now.com/`

const axios = require('axios'),
  qs = require('querystring'),
  Table = require('./table'),
  attachments = require('./attachments')


let getData = res => res.data
let getResult = res => res.data.result
let getError = res => res.response.data


class Client {

  constructor(auth) {
    // ServiceNow HTTP client
    this.client = axios.create({
      baseURL: baseURL,
      headers: { Authorization: `Bearer ${auth.access_token}` }
    })
  }

  static getAuthUrl(options) {
    let query = qs.stringify({
      state: options.state,
      response_type: "code",
      client_id: options.client_id
    })

    return `${options.baseUrl}/oauth_auth.do?${query}`
  }

  static getToken(code) {
    let params = qs.stringify({
      code: code,
      grant_type: "authorization_code",
      redirect_uri: SN_CALLBACK_URL
    })

    // OAuth2 Authorization header 
    let auth = new Buffer(SN_CLIENT_ID + ':' + SN_CLIENT_SECRET).toString('base64')
    let headers = { Authorization: `Basic ${auth}` }

    return axios.post(`${baseURL}/oauth_token.do`, params, { headers }).then(getData).catch(getData)
  }

  get(path, params) {
    return this.client.get(path, { params }).then(getResult).catch(getError)
  }

  post(path, record) {
    return this.client.post(path, record).then(getResult).catch(getError)
  }

  getTable(name) {
    return new Table(this, name)
  }
}

module.exports = Client