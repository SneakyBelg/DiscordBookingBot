const { Collection, Client, Intents } = require("discord.js")
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require("./config.json")
const fs = require("fs");
const fetch = require('node-fetch');
const mongoose = require('mongoose');
bot.commands = new Collection();

const botData = fetch(`https://discord.com/api/v8/users/897776805946220564`, {
    headers: {
        Authorization: `Bot ${config.token}`
    }
})

fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });

});

mongoose.connect(config.mongodb_SRV).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
})

bot.on("ready", () => {
    console.log(bot.user.username + " is online.")
});

bot.on("message", async message => {
    //a little bit of data parsing/general checks
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    let content = message.content.split(" ");
    let command = content[0];
    let args = content.slice(1);
    let prefix = config.prefix;

    //checks if message contains a command and runs it
    let commandfile = bot.commands.get(command.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args, mongoose);
})


bot.login(config.token)