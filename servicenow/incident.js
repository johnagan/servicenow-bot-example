const moment = require('moment'),      
      client = require('./client');


function fields(i) {
  return [
    { title: 'Category', value: i.category.display_value, short: true }, 
    { title: 'Priority', value: i.priority.display_value, short: true },
    { title: 'State', value: i.incident_state.display_value, short: true },
    { title: 'Assigned To', value: i.assigned_to.display_value, short: true },
  ]
}

function actions(i) {
  return [{
    "name": "priority",
    "text": "Low",
    "type": "button",
    "value": "low"
  },{
    "name": "priority",
    "text": "Medium",
    "type": "button",
    "value": "medium"
  },{
    "name": "priority",
    "text": "High",
    "type": "button",
    "value": "high"
  }]
}

function color(i) {
  let color = '';
  
  switch(i.incident_state.display_value) {
    case 'In Progress': color = '#4bd762';
    case 'On Hold': color = '#ffca1f';
    default: color = '';
  }

  return color;
}

function attachment(i) {
  // console.log(i);
  return {
    // pretext: `${i.incident_state}`,
    color: color(i),
    callback_id: "incident",
    text: i.description.display_value,
    author_name: i.company.display_value,
    author_link: `${client.baseURL}/nav_to.do?uri=sys_user.do?sys_id=${i.opened_by.value}`,    
    title: `${i.number.display_value} - ${i.short_description.display_value}`,
    title_link: `${client.baseURL}/nav_to.do?uri=incident.do?sys_id=${i.sys_id.value}`,
    // footer: `Opened by ${i.opened_by.display_value} ${moment(i.opened_at).fromNow()}`,
    fields: fields(i),
    actions: actions(i)
  }
}

function createMessage(result) {
  return Promise.resolve({
    text: `Incident created successfully`,
    attachments: [attachment(result)]
  });
}

function searchMessage(query, results) {
  return Promise.resolve({
    text: `Results found for ${query}`,
    attachments: results.map(attachment)
  });
}

function getMessage(result) {
  return Promise.resolve({
    attachments: [attachment(result)]
  });
}

exports.create = record => {
  return client.create('incident', record).then(createMessage);
}

exports.search = query => {
  return client.search('incident', query).then(searchMessage.bind(null, query));
}

exports.unfurl = text => {
  let match = text.match(/sys_id=(\w+)/i);
  let params = { sysparm_display_value: 'all' };
  if (match) return client.get('incident', params, match[1]).then(getMessage);
  else return Promise.reject(text);
}
