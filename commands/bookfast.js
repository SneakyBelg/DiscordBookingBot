const Discord = require('discord.js')
const serviceModel = require('../models/serviceSchema');

module.exports.run = async(bot, message, args) => {
    let staffrole = message.guild.roles.cache.find(role => role.name === "staff");
    console.log
    if (message.member.roles.has(staffrole.id)) {

        let serviceDataForChoice;

        let sliceOnSeperator = message.content.split("$");
        sliceOnSeperator[0] = sliceOnSeperator[0].replace("bb!book ", "");
        console.log(sliceOnSeperator);
        var commandVariables = {
            dancerName: sliceOnSeperator[0],
            duration: sliceOnSeperator[1],
            typeOfService: sliceOnSeperator[2],
            amountOfPeople: sliceOnSeperator[3],
            startingTime: sliceOnSeperator[4]
        };

        try {
            serviceDataForChoice = await serviceModel.findOne({ identifier: commandVariables.typeOfService })
        } catch (err) {
            console.log(err);
        }

        function CalculatePrice(amountOfExtraPeople, selectedService, durationInUnits) {
            let defaultPriceForService = (selectedService.pricePerHalfHour * durationInUnits);
            let priceForExtraPeople = 0;
            if (commandVariables.typeOfService != 1) {
                console.log("Entered creation");
                if (selectedService.pricePerExtraPerson != null && selectedService.pricePerExtraPerson != 0) {
                    if (amountOfExtraPeople != 0 && amountOfExtraPeople != null) {
                        priceForExtraPeople = ((selectedService.pricePerExtraPerson * parseInt(amountOfExtraPeople)) * durationInUnits);
                    }
                }
            } else if (commandVariables.typeOfService == 1) {
                if (amountOfExtraPeople != 0 && amountOfExtraPeople != null) {
                    message.channel.send(`Something went wrong during service creation.\n**Reminder:** GF/BF Service can't have multiple people`);
                    return;
                }
            } else {
                message.channel.send(`Something went wrong during service creation.\n**Reminder:** GF/BF Service can't have multiple people`);
                return;
            }

            let totalPrice = (priceForExtraPeople + defaultPriceForService);
            SendMessageToChannel(totalPrice);
        };

        async function SendMessageToChannel(totalprice) {
            var date = new Date();
            let sliceTime = commandVariables.startingTime.split(":");
            var mytime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sliceTime[0], sliceTime[1], 00);

            var endtime = new Date(mytime);
            endtime.setMinutes(mytime.getMinutes() + (commandVariables.duration * 30));

            if (commandVariables.amountOfPeople == 0 || commandVariables.amountOfPeople == null) {
                const embedBookingDetails = new Discord.RichEmbed()
                    .setColor('#ff961f')
                    .setTitle("Booking")
                    .addField("Dancer", commandVariables.dancerName, inline = true)
                    .addField("Type", serviceDataForChoice.type, inline = true)
                    .addField("Duration", (commandVariables.duration * 30) + " minutes")
                    .addField("Starting time", mytime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("End time", endtime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("Price", totalprice + " Gil")
                    .setFooter('©Foxden Booking Bot');

                const msg = await message.channel.send(embedBookingDetails)
            } else {
                const embedBookingDetails = new Discord.RichEmbed()
                    .setColor('#ff961f')
                    .setTitle("Booking")
                    .addField("Dancer", commandVariables.dancerName, inline = true)
                    .addField("Type", serviceDataForChoice.type, inline = true)
                    .addField("Duration", (commandVariables.duration * 30) + " minutes")
                    .addField("Starting time", mytime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("End time", endtime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("Amount of extra people", commandVariables.amountOfPeople)
                    .addField("Price", totalprice + " Gil")
                    .setFooter('©Foxden Booking Bot');
                const msg = await message.channel.send(embedBookingDetails)
            }
        }

        CalculatePrice(
            commandVariables.amountOfPeople,
            serviceDataForChoice,
            commandVariables.duration,
        );
        console.log(serviceDataForChoice);
    } else await message.channel.send(`YOU SHALL NOT PASS!`);
}
module.exports.help = {
    name: "bookfast"
}