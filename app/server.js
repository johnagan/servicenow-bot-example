const { PORT } = process.env

const
  express = require('express'),
  bodyParser = require('body-parser'),
  controller = require('./controller'),
  app = express()


// json body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// servicenow oauth callback
app.get('/servicenow', (req, res) => {
  let { state, code } = req.query

  // invalidate if no code returned
  if (!code) return res.sendStatus(401)

  // authenticate the code with ServiceNow
  controller.authenticate(state, code).then(() => {
    res.send("You've successfully connected your ServiceNow account to Slack. Please switch back to Slack and try your command again.")
  })
})


// slack slash commands
app.post('/slack', (req, res) => {
  let { text, user_id } = req.body

  // slack message requesting authorization
  let unauthorized = url => {
    let text = `You must <${url}|authorize with ServiceNow> before runing this command`
    return res.json({ text })
  }

  // render the message to slack
  let render = msg => res.json(msg)

  // shortcut for controller methods
  let { validateAuth, executeCommand, buildMessage } = controller

  // bind text to execute call
  let execute = executeCommand.bind(null, text)

  // execute the command, build a slack message, and render
  validateAuth(user_id).catch(unauthorized).then(execute).then(buildMessage).then(render)
})


// start webserve
app.listen(PORT, () => {
  console.log(`server started on ${PORT}`)
})