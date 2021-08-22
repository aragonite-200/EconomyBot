const profileModel = require("../models/profileSchema");
module.exports = {
    name: "give",
    aliases: ["gv"],
    permissions: ["ADMINISTRATOR"],
    description: "give some money",
    async execute(message, args, cmd, client, discord, profileData) {
        if(message.member.id != "602028994157740033") return message.channel.send(`Sorry only **Aragonite200** can give money😉`)
        if(!args.length) return message.channel.send('You need to mention an user to give them some money')
        const amount = args[1]
        const target = message.mentions.users.first();
        if(!target) return message.channel.send("That user doesnt'exist")
        if (amount % 1 != 0 || amount <= 0) return message.channel.send("Deposit amount must be a whole number");
        
        try{
            const targetData = await profileModel.findOne({ userID: target.id})
            if(!targetData) return message.channel.send("This user doesn't exist in the db");

            await profileModel.findOneAndUpdate({
                userID: target.id
            }, {
                $inc: {
                    coins: amount,
                }
            }
            );
            return message.channel.send(`This player has been given their coins! ${amount} coins!`);
        }catch(err){

        }
    },

};