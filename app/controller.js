const { SN_CLIENT_ID, SN_CLIENT_SECRET, SN_DOMAIN, SN_CALLBACK_URL } = process.env

const ServiceNow = require('./servicenow')

// servicenow instance
let servicenow = new ServiceNow({
  subdomain: SN_DOMAIN,
  client_id: SN_CLIENT_ID,
  client_secret: SN_CLIENT_SECRET,
  callback_url: SN_CALLBACK_URL
})


// replace this with a database
const SAMPLE_DATA_STORE = {}


/**
 * Authenticate a ServiceNow OAuth code
 * 
 * @param {string} state - the OAuth2 state
 * @param {string} code  - the OAuth2 access code
 * @returns {Promise} a Promise containing the access info
 */
function authenticate(state, code) {
  // save auth to datastore
  let saveAuth = auth => SAMPLE_DATA_STORE[state] = auth

  // request access info from ServiceNow
  return servicenow.getToken(code).then(saveAuth)
}


/**
 * Validate a Slack user has a ServiceNow token
 * 
 * @param {string} user_id 
 * @returns {Promise} a Promise containing an auth if successful or auth url if not
 */
function validateAuth(user_id) {
  // load user's auth from datastore
  let auth = SAMPLE_DATA_STORE[user_id]

  if (auth) {
    // token found
    return Promise.resolve(auth)
  } else {
    // user not authenticated - present authorization url  
    let url = servicenow.getAuthUrl({ state: user_id })
    return Promise.reject(url)
  }
}


/**
 * Execute a ServiceNow command
 * 
 * @param {object} auth - the user's ServiceNow auth
 * @param {string} text - the command issued by the user
 * @returns {Promise} a Promise containing the results
 */
function executeCommand(text, auth) {
  // load client from auth and parse command text
  let client = servicenow.connect(auth)
  let match = text.match(/create (.+)/i)

  if (match) { // create
    let record = { short_description: match[1] }
    return client.create('incident', record)
  } else { // search
    return client.search('incident', text)
  }
}


/**
 * Build an Incident Message Attachment
 * 
 * @param {object} i - the incident object
 * @returns {object} the message attachment
 */
function buildAttachment(i) {
  // i.company.display_value,
  let attachment = {
    // pretext: `${i.incident_state}`,
    callback_id: "incident",
    author_name: i.opened_by.display_value,
    author_subname: i.opened_at.display_value,
    author_link: `${servicenow.baseURL}/nav_to.do?uri=sys_user.do?sys_id=${i.opened_by.value}`,
    title: `${i.number.display_value} - ${i.short_description.display_value}`,
    title_link: `${servicenow.baseURL}/nav_to.do?uri=incident.do?sys_id=${i.sys_id.value}`,
    fields: [
      { title: 'Category', value: i.category.display_value, short: true },
      { title: 'Priority', value: i.priority.display_value, short: true },
      { title: 'State', value: i.incident_state.display_value, short: true },
      { title: 'Assigned To', value: i.assigned_to.display_value, short: true },
      { title: 'Description', value: i.description.display_value }
    ]
  }

  // toggle colors based on status
  let { display_value } = i.incident_state
  if (display_value === 'On Hold') attachment.color = '#ffca1f'
  if (display_value === 'In Progress') attachment.color = '#4bd762'

  return attachment
}


/**
 * Build an Incident Message
 * 
 * @param {object|array} result - a incident or array of incidents
 * @returns {object} the message
 */
function buildMessage(result) {
  // treat everyting as an array to account for single and multiple results
  if (!Array.isArray(result)) result = [result]

  // build the message attachments
  let attachments = result.map(buildAttachment)
  return { attachments }
}


module.exports = { validateAuth, authenticate, executeCommand, buildMessage }