const Discord = require('discord.js')

module.exports.run = async(bot, message, args) => {
    if (message.member.roles.cache.find(x => x.name === "staff")) {
        await message.channel.send(`Confirmed!`);
    } else await message.channel.send('Denied');
}
module.exports.help = {
    name: "ping"
}