class Table {

  constructor(client, name, attachment) {
    this.name = name
    this.client = client
    this.attachment = attachment
  }

  list(params) {
    return this.client.get(`api/now/table/${this.name}`, params)
  }

  get(params, id) {
    let buildMessage = result => {
      return {
        attachments: [this.attachment(result)]
      }
    }

    let url = `api/now/table/${this.name}/${id}`
    return this.client.get(url, params).then(buildMessage)
  }

  create(record) {
    let buildMessage = result => {
      return {
        text: `Incident created successfully`,
        attachments: [this.attachment(result)]
      }
    }

    let url = `api/now/table/${this.name}?sysparm_display_value=all`
    return this.client.post(url, record).then(buildMessage)
  }

  search(query) {
    let buildMessage = results => {
      return {
        text: `Results found for ${query}`,
        attachments: results.map(this.attachment)
      }
    }

    let params = { sysparm_display_value: 'all', sysparm_limit: 5, sysparm_query: query }
    return this.list(params).then(buildMessage)
  }

}

module.exports = Table