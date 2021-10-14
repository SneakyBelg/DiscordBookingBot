const Discord = require('discord.js')
const serviceModel = require('../models/serviceSchema');
const dancerModel = require('../models/dancerSchema');

module.exports.run = async(bot, message, args) => {
    if (message.member.roles.cache.find(x => x.name === "staff")) {
        async function GetDancerData() {
            let dancers;
            let dancerString = "";
            try {
                dancers = await dancerModel.find();
                for (let i = 0; i < dancers.length; i++) {
                    dancerString += (`${dancers[i].identifier} - **${dancers[i].name}**\n`)
                }
            } catch (err) {
                console.log(err);
            }
            return dancerString;
        }

        async function GetServiceData() {
            let services;
            let serviceString = "";
            try {
                services = await serviceModel.find();
                for (let i = 0; i < services.length; i++) {
                    serviceString += (`${services[i].identifier} - **${services[i].type}**\n`)
                }
            } catch (err) {
                console.log(err);
            }
            return serviceString;
        }

        async function SendDancerEmbed() {
            const dancerString = await GetDancerData();
            const dancerEmbed = new Discord.RichEmbed()
                .setColor('#ff961f')
                .setTitle("Which dancer would you like to book? Please respond with the associated number.")
                .setDescription(dancerString)
                .setFooter('©Foxden Booking Bot');

            return dancerEmbed;

        };
        async function GenerateServiceEmbed() {
            const serviceString = await GetServiceData();
            const serviceEmbed = new Discord.RichEmbed()
                .setColor('#ff961f')
                .setTitle("Which dancer would you like to book? Please respond with the associated number.")
                .setDescription(serviceString)
                .setFooter('©Foxden Booking Bot');

            return serviceEmbed;

        };
        async function GenerateDurationEmbed() {
            const durationEmbed = new Discord.RichEmbed()
                .setColor('#ff961f')
                .setTitle("How many duration units to book? E.G: 1 unit = 30 minutes.")
                .setDescription("")
                .setFooter('©Foxden Booking Bot');

            return durationEmbed;
        };
        async function GenerateAmountEmbed() {
            const durationEmbed = new Discord.RichEmbed()
                .setColor('#ff961f')
                .setTitle("How many extra people?")
                .setDescription("Please enter the amount of people that are extra to the service.")
                .setFooter('©Foxden Booking Bot');

            return durationEmbed;
        };
        async function GenerateTimeEmbed() {
            const durationEmbed = new Discord.RichEmbed()
                .setColor('#ff961f')
                .setTitle("What is the starting time?")
                .setDescription("Please enter the service start time in the HH:MM format!")
                .setFooter('©Foxden Booking Bot');

            return durationEmbed;
        };

        message.channel.bulkDelete(1);
        const filter = m => m.author.id == message.author.id;

        //START DANCER SELECTION
        const msg = await message.channel.send(await SendDancerEmbed());
        const dancerAnswer = await message.channel.awaitMessages(filter, { max: 1, time: 40000 }); //40s
        //ERROR HANDLING
        if (!dancerAnswer.size) {
            msg.delete();
            return message.channel.send("Cancelled booking due to no response");
        }
        //SAVE DANCER ANSWER
        let chosenDancer = dancerAnswer.first().content.toLowerCase();
        message.channel.bulkDelete(1);
        //END DANCER CHOICE

        //START SERVICE SELECTION
        msg.edit(await GenerateServiceEmbed())
        const serviceAnswer = await message.channel.awaitMessages(filter, { max: 1, time: 40000 }); //40s
        //ERROR HANDLING
        if (!serviceAnswer.size) {
            msg.delete();
            return message.channel.send("Cancelled booking due to no response");
        }
        //SAVE SERVICE ANSWER
        let chosenService = serviceAnswer.first().content.toLowerCase();
        message.channel.bulkDelete(1);
        //END SERVICE CHOICE

        //START DURATION SELECTION
        msg.edit(await GenerateDurationEmbed())
        const durationAnswer = await message.channel.awaitMessages(filter, { max: 1, time: 40000 }); //40s
        //ERROR HANDLING
        if (!durationAnswer.size) {
            msg.delete();
            return message.channel.send("Cancelled booking due to no response");
        }
        //SAVE DURATION ANSWER
        let chosenDuration = durationAnswer.first().content.toLowerCase();
        message.channel.bulkDelete(1);
        //END DURATION CHOICE

        //START AMOUNT SELECTION
        msg.edit(await GenerateAmountEmbed())
        const amountAnswer = await message.channel.awaitMessages(filter, { max: 1, time: 40000 }); //40s
        //ERROR HANDLING
        if (!amountAnswer.size) {
            msg.delete();
            return message.channel.send("Cancelled booking due to no response");
        }
        //SAVE AMOUNT ANSWER
        let chosenAmount = amountAnswer.first().content.toLowerCase();
        message.channel.bulkDelete(1);
        //END AMOUNT CHOICE

        //START TIME SELECTION
        msg.edit(await GenerateTimeEmbed())
        const timeAnswer = await message.channel.awaitMessages(filter, { max: 1, time: 40000 }); //40s
        //ERROR HANDLING
        if (!timeAnswer.size) {
            msg.delete();
            return message.channel.send("Cancelled booking due to no response");
        }
        //SAVE TIME ANSWER
        let chosenTime = timeAnswer.first().content.toLowerCase();
        message.channel.bulkDelete(1);
        //END TIME CHOICE



        console.log('Chosen dancer: ' + chosenDancer);
        console.log('Chosen service: ' + chosenService);
        console.log('Chosen duration: ' + chosenDuration);
        console.log('Chosen amount of extra people: ' + chosenAmount);
        console.log('Selected start time: ' + chosenTime);

        let serviceDataForChoice;
        let dancerDataForChoice;

        try {
            serviceDataForChoice = await serviceModel.findOne({ identifier: chosenService });
            dancerDataForChoice = await dancerModel.findOne({ identifier: chosenDancer });
        } catch (err) {
            console.log(err);
        }

        function CalculatePrice(amountOfExtraPeople, selectedService, durationInUnits) {
            let defaultPriceForService = (selectedService.pricePerHalfHour * durationInUnits);
            let priceForExtraPeople = 0;
            if (chosenService != 1) {
                console.log("Entered creation");
                if (selectedService.pricePerExtraPerson != null && selectedService.pricePerExtraPerson != 0) {
                    if (amountOfExtraPeople != 0 && amountOfExtraPeople != null) {
                        priceForExtraPeople = ((selectedService.pricePerExtraPerson * parseInt(amountOfExtraPeople)) * durationInUnits);
                    }
                }
            } else if (chosenService == 1) {
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
            let sliceTime = chosenTime.split(":");
            var mytime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sliceTime[0], sliceTime[1], 00);

            var endtime = new Date(mytime);
            endtime.setMinutes(mytime.getMinutes() + (chosenDuration * 30));

            if (chosenAmount == 0 || chosenAmount == null) {
                const embedBookingDetails = new Discord.RichEmbed()
                    .setColor('#ff961f')
                    .setTitle("Booking")
                    .addField("Dancer", dancerDataForChoice.name, inline = true)
                    .addField("Type", serviceDataForChoice.type, inline = true)
                    .addField("Duration", (chosenDuration * 30) + " minutes")
                    .addField("Starting time", mytime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("End time", endtime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("Price", totalprice + " Gil", inline = true)
                    .addField("Staff cut", (totalprice * 0.7) + " Gil", inline = true)
                    .addField("Foxden cut", (totalprice * 0.3) + " Gil", inline = true)
                    .setFooter('©Foxden Booking Bot');

                const embedmsg = await message.channel.send(embedBookingDetails)
            } else {
                const embedBookingDetails = new Discord.RichEmbed()
                    .setColor('#ff961f')
                    .setTitle("Booking")
                    .addField("Dancer", dancerDataForChoice.name, inline = true)
                    .addField("Type", serviceDataForChoice.type, inline = true)
                    .addField("Duration", (chosenDuration * 30) + " minutes")
                    .addField("Starting time", mytime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("End time", endtime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' }), inline = true)
                    .addField("Amount of extra people", chosenAmount)
                    .addField("Price", totalprice + " Gil", inline = true)
                    .addField("Staff cut", (totalprice * 0.7) + " Gil", inline = true)
                    .addField("Foxden cut", (totalprice * 0.3) + " Gil", inline = true)
                    .setFooter('©Foxden Booking Bot');
                const embedmsg = await message.channel.send(embedBookingDetails)
            }
            msg.delete();
        }

        CalculatePrice(
            chosenAmount,
            serviceDataForChoice,
            chosenDuration,
        );
        console.log(serviceDataForChoice);
    } else await message.channel.send(`YOU SHALL NOT PASS!`);


}
module.exports.help = {
    name: "book"
}