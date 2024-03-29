require("dotenv").config();
const profileModel = require("../../models/profileSchema");

const cooldowns = new Map()
module.exports = async (Discord, client, message) => {
  const prefix = process.env.PREFIX;

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  let profileData;
  try {
    profileData = await profileModel.findOne({ userID: message.author.id });
    if (!profileData) {
      let profile = await profileModel.create({
        userID: message.author.id,
        serverID: message.guild.id,
        coins: 1000,
        bank: 0,
      });
      profile.save();
    }
  } catch (err) {
    console.log(err);
  }

  const args = message.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd) || client.commands.find((a) => a.aliases && a.aliases.includes(cmd));
  //if (!command) return message.channel.send()

  const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
  ]

  if(command.permissions.length){
    let invalidPerms = []
    for(const perm of command.permissions){
      if(!validPermissions.includes(perm)){
        return console.log(`Invalid Permissions ${perm}`);
      }
      if(!message.member.hasPermission(perm)){
        invalidPerms.push(perm);
      }
    }
    if (invalidPerms.length){
      return message.channel.send(`Missing Permissions: \`${invalidPerms}\``);
    }
  }

  if (command.cooldown) {
    if (!cooldowns.has(command.name)) {
      cooldawns.set(command.name, new Discord.Collection());
    }

    const current_time = Date.now();
    const time_stamps = cooldawns.get(command.name);
    const cooldawn_amount = command.cooldown * 1000;

    if (time_stamps.has(message.author.id)) {
      const expiration_time = time_stamps.get(message.author.id) + cooldawn_amount;

      if (current_time < expiration_time) {
        const time_left = (expiration_time - current_time) / 1000;

        return message.reply(`Please Wait ${time_left.toFixed(1)} more seconds before using ${command.name}`);
      }
    }

    time_stamps.set(message.author.id, current_time);
    setTimeout(() => time_stamps.delete(message.author.id), cooldawn_amount);
  }

  try {
    command.execute(message, args, cmd, client, Discord, profileData  )
  } catch (err) {
    //message.reply('Non riesco a trovare il comando!');
    message.channel.send(err);
  }
};