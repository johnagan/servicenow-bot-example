# ServiceNow Bot for Slack Example
A sample bot for Slack that will search, create, and unfurl ServiceNow Incidents.

## Demonstration

### Search
![servicenow-search](https://cloud.githubusercontent.com/assets/35968/21025466/6ec5be02-bd3d-11e6-8388-9b636d805fe9.gif)

### Create
![servicenow-create](https://cloud.githubusercontent.com/assets/35968/21025467/6ec7c742-bd3d-11e6-8cd7-f1d1f3ec670f.gif)

### Unfurls
![servicenow-unfurl](https://cloud.githubusercontent.com/assets/35968/21025465/6ebe6f12-bd3d-11e6-9a39-019b10bcb66c.gif)



## Configuration

### Prerequisites
* [Setup OAuth in Slack](https://api.slack.com/docs/oauth)
* [Setup OAuth in ServiceNow](http://wiki.servicenow.com/index.php?title=OAuth_Setup#gsc.tab=0)


### Environment Variables

Variable | Value | Description
:---|:---|:---
**PORT** | 3000 | The HTTP Port to run the webserver on
**SCOPE** | bot,commands | The [Slack OAuth scope](https://api.slack.com/docs/oauth-scopes) to request
**CLIENT_ID** | N/A | The [Slack OAuth Client Id](https://api.slack.com/docs/oauth) code
**CLIENT_SECRET** | N/A | The [Slack OAuth Client Secret](https://api.slack.com/docs/oauth) code
**TOKEN** | N/A | The [Slack Verification Token](https://api.slack.com/slash-commands#validating_the_command) (optional)
**STORE** | data/teams.json | A string path to a filestore or a custom store object
**SN_CLIENT_ID** | N/A | ServiceNow OAuth Client ID
**SN_CLIENT_SECRET** | N/A | ServiceNow OAuth Client Secret
**SN_LOGIN** | N/A | ServiceNow Login
**SN_PASSWORD** | N/A | ServiceNow Password
**SN_DOMAIN** | N/A | ServiceNow Domain
**SLASH_COMMAND** | incidents | The Slash Command to trigger search and create

## Running
```
npm start
```
