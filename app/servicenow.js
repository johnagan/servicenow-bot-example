const
  axios = require('axios'),
  qs = require('querystring')


// axios callback to return the data from a promise
let getData = res => res.data
let getResult = res => res.data.result
let getResponse = res => res.response.data


class ServiceNow {

  /**
   * Creates an instance of ServiceNow
   * 
   * @param {object} options - the default class options
   * @param {object} auth - (optional) a user's OAuth access info
   */
  constructor(options, auth) {
    Object.assign(this, options, { options })
    this.baseURL = `https://${this.subdomain}.service-now.com/`
    this.client = axios.create({ baseURL: this.baseURL })

    // if authorization passed in, add it to headers
    if (auth && auth.access_token)
      this.client.defaults.headers = { Authorization: `Bearer ${auth.access_token}` }
  }


  /**
   * Get OAuth2 Authorization Url
   * 
   * @param {object} options - the arguments to pass to the OAuth requet
   * @returns {string} the authoriation url
   */
  getAuthUrl(options) {
    let query = {
      response_type: "code",
      client_id: this.client_id
    }

    Object.assign(query, options)
    return `${this.baseURL}/oauth_auth.do?` + qs.stringify(query)
  }


  /**
   * Get the OAuth2 Access Token
   * 
   * @param {string} code - the authorization code rturned from servicenow oauth
   * @returns {Promise} a promise containing the user's authorization tokens
   */
  getToken(code) {
    let params = qs.stringify({
      code: code,
      grant_type: "authorization_code",
      redirect_uri: this.callback_url
    })

    // OAuth2 Authorization header 
    let auth = new Buffer(this.client_id + ':' + this.client_secret).toString('base64')
    let headers = { Authorization: `Basic ${auth}` }

    return this.client.post('oauth_token.do', params, { headers }).then(getData).catch(getData)
  }


  /**
   * Create a ServiceNow client for a user
   * 
   * @param {object} auth - the user's OAuth access info
   * @returns {ServiceNow} the scoped ServiceNow client
   */
  connect(auth) {
    return new ServiceNow(this.options, auth)
  }


  /**
   * Send data to ServiceNow's API
   * 
   * @param {string} path - the path to send data to
   * @param {object} params - the params to send to the api
   * @param {stting} method - the method to use (defaults to get)
   * @returns {Promise} a promise containing the api results
   */
  send(path, params, method) {
    return this.client[method || 'get'](path, params).then(getResult).catch(getResponse)
  }


  /**
   * List results from a ServiceNow table
   * 
   * @param {string} name - the table name to query
   * @param {object} params - the params to send to the api
   * @returns {Promise} a promise containing the list results
   */
  list(name, params) {
    return this.send(`api/now/table/${name}`, { params })
  }


  /**
   * Get a single result from a ServiceNow table
   * 
   * @param {string} name - the table name to query
   * @param {string} id - the record id to select
   * @param {object} params - the params to send to the api
   * @returns {Promise} a promise containing the result
   */
  get(name, id, params) {
    return this.send(`api/now/table/${name}/${id}`, { params })
  }


  /**
   * Create a new record for a ServiceNow table
   * 
   * @param {string} name - the table name to create in
   * @param {object} record - the record to create in the table
   * @returns {Promise} a promise containing the create results
   */
  create(name, record) {
    return this.send(`api/now/table/${name}?sysparm_display_value=all`, record, 'post')
  }


  /**
   * Search a ServiceNow table
   * 
   * @param {string} name - the table name to search
   * @param {object} query - the text to search for
   * @returns {Promise} a promise containing the search results
   */
  search(name, query) {
    let params = { sysparm_display_value: 'all', sysparm_limit: 5, sysparm_query: query }
    return this.list(name, params)
  }

}

module.exports = ServiceNow