require('module-alias/register')
const config = require('./config.json')
const { Client, MessageEmbed } = require('discord.js')
const delay = ms => new Promise(res => setTimeout(res, ms));

const token = config.token
const prefix = config.prefix

const client = new Client({
    disableEveryone: true
})

client.on('ready', () => {
    client.user.setPresence({ 
        activity: { 
            name: config.activity.name,
            type: config.activity.type,
        }, status: config.activity.status
    })

    console.log('Bot has logged in!')
})

client.on('message', async (message) => {
    if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;
    if(!message.member) message.member = await message.guild.fetchMember(message);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if(cmd == 'purge') {
        if(!message.member.hasPermission(config.permission)) return message.channel.send(':x: Invalid permissions.')
        if(!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.channel.send(':x: Bot has invalid permissions.')

        const channel = message.channel;

        if(args.length == 0) {
            channel.send(`Must provide a limit number.`)
            return;
        }

        const limit = Number(args[0], 10)

        if(isNaN(limit)) {
            channel.send('Limit must be a valid number.')
            return;
        }

        if(!Number.isInteger(limit)) {
            channel.send('Limit must be a whole number.')
            return;
        }

        if(!limit || limit < 2 || limit > 1000) {
            channel.send('Limit must be a number between `2` and `1000`')
            return;
        }

        if(limit > 100) {
            let repeat = Math.floor(limit/100)
            let extra = limit/100 - repeat * 100;

            for (let i = 0; i <= repeat; i++) {
                let fetched = await channel.messages.fetch({ limit: 100 })
                try { await channel.bulkDelete(fetched).then(messages => channel.send(`Purged \`${messages.size}\` messages from ${channel}!`)) } catch (err) {
                    console.log(err)
                    channel.send('Cannot delete messages over 14 days old, please try a lower limit or a different channel.')
                    return;
                }
                await delay(500);
            }

            if(extra > 1) {
                let fetched = await channel.messages.fetch({ limit: extra })
                let toDelete = fetched.filter(m => !m.author.bot);
                try { await channel.bulkDelete(toDelete).then(messages => channel.send(`Purged \`${messages.size}\` messages from ${channel}!`)) } catch (err) {
                    console.log(err)
                    channel.send(':x: Cannot delete messages over 14 days old, please try a lower limit or a different channel.')
                    return;
                }
            }
        
        } else {
            let fetched = await channel.messages.fetch({ limit: limit })
                try { await channel.bulkDelete(fetched).then(messages => channel.send(`Purged \`${messages.size}\` messages from ${channel}!`)) } catch (err) {
                    console.log(err)
                    channel.send(':x: Cannot delete messages over 14 days old, please try a lower limit or a different channel.')
                    return;
                }
        }
    }

    if(cmd == 'help') {
        let embed = new MessageEmbed()
        embed.setAuthor(`${client.user.tag} Help`, client.user.displayAvatarURL({ dynamic: true }))
        embed.setDescription(`**${prefix}help** - Display this menu.
                              **${prefix}purge <Number> - Delete messages from a channel in bulk. Bypasses Discord's usual limit of \`100\`.
                              \nSupport the developer by checking out the source code on [github.com](https://github.com/amayas-dev/djs-purge-bot)!`
                            )
        embed.setTimestamp()
    }
})