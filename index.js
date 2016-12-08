const {PORT, SCOPE, CLIENT_ID, CLIENT_SECRET, TOKEN, STORE, SLASH_COMMAND} = process.env,
      incident = require('./servicenow/incident'),
      slack = require('express-slack'),
      express = require('express'),
      app = express();


app.use('/slack', slack({
  store: STORE,
  token: TOKEN,
  scope: SCOPE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET
}));


slack.on('message', (msg, bot) => {
  if (!msg.text) return;
  incident.unfurl(msg.text).then(bot.reply.bind(bot));
});


slack.on(`/${SLASH_COMMAND}`, (msg, bot) => {
  let reply = bot.reply.bind(bot);
  let match = msg.text.match(/create (.+)/i);
  let error = e => {
    console.log(e);
    bot.replyPrivate("There was an error");
  }

  if (match) { // create
    let params = { short_description: match[1] };
    incident.create(params).then(reply).catch(error);
  } else {
    bot.replyPrivate(`searching for ${msg.text}...`);
    incident.search(msg.text).then(reply).catch(error);
  }
});


app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});