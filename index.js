const Discord = require("discord.js")
const bot = new Discord.Client()
const fs = require("fs")
const figlet = require('figlet');
const colors = require('colors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync("database.json");
const db = low(adapter)
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
db.defaults({ commandes: [], blacklist: []}).write()
bot.login(token)

bot.on('message', async message => {
    var Author = message.author;
    var Authorid = Author.id;
    async function isMailCorrupted(){
        let filehandle = null;
        var contents = fs.readFileSync('accounts.txt', 'utf8');
        let lines = contents.replace('\r', '').split('\n');
        for (let line of lines) {
            if (line == all) {
                return true;
            }
        }
        return false;
    }
    if(message.content.startsWith(prefix + "admin-achat")){        
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        if(!message.member.hasPermission("VIEW_AUDIT_LOG")) return message.channel.send("Tu n'as pas la permission d'effectuer cette commande ! :x:")
        message.delete()
        let i = message.author.id;
        let args = message.content.split(" ").slice(1)
        args[0] = message.mentions.members.first()
        let user = args[0]
        let u = user.id
        if(!u) return message.channel.send("Veuillez mentionner quelqu'un ! :x:\nUsage : " + prefix + "admin-achat @Utilisateur")
        if(db.get("commandes").find({id: u}).value()){
            message.channel.send(`<@${u}> a déjà la commande **#${u}** en cours, pour toute annulation veuillez entrer la commande : ` + "`" + prefix + "reset @Utilisateur` !" )
            return;
        }
        const filter = response => {
            return response.author.id === Authorid;
        }
        const rfilter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        message.channel.send(`Veuillez entrer le pseudo de <@${u}> en jeu, <@${i}>.`).then((m) => {
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 300000,
                errors: ['time'],
            }).then(collected => {
                const name = collected.first()
                message.channel.bulkDelete(1)
                m.edit(`Veuillez entrer la description de la commande de <@${u}>, <@${i}>.`).then((m) => {
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 300000,
                        errors: ['time'],
                    }).then(collected => {
                        const msge = collected.first()
                        message.channel.bulkDelete(1)
                        m.edit(`Veuillez entrer le prix de la commande de <@${u}>, <@${i}>.`).then((m) => {
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 300000,
                                errors: ['time'],
                            }).then((collected) => {
                                message.channel.bulkDelete(1)
                                var prix = collected.first()
                                const p = `${prix}`
                                const d = `${msge}`
                                const n = `${name}`
                                if(!(p.includes("k") || p.includes("K") || p.includes(".") || p.includes(" "))){
                                    if(isNaN(p)){
                                        m.edit(`Commande annulée, car vous n'avez pas indiqué un prix éligible <@${i}> ! :x:`)
                                        return;
                                    }
                                }
                                let achat = new Discord.RichEmbed().setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL).setTitle("**[:shopping_cart:] ACHAT / COMMANDE**").setDescription("**— — — — (`"+ prefix + "achat`) — — — —**").addField("**__Récapitulatif de votre commande,__**\n**`Veuillez confirmer ou non l'envoi de celle-ci afin qu'un vendeur puisse l'a prendre en charge.`**", `COMMANDE-**#${u}**\nUtilisateur : **<@${u}>,**\nPseudo : **${n}**\nDescription : **${d}**,\nPrix : **${p}$**.`)                .setColor("RED").setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1").setTimestamp().setThumbnail(message.guild.iconURL)
                                let nc = new Discord.RichEmbed().setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL).setTitle("**[:shopping_cart:] NOUVELLE COMMANDE**").setDescription("**— — — — (`"+ prefix + "commande #<identifiant>`) — — — —**").addField("**Nouvelle commande !**", `COMMANDE-**#${u}**\nUtilisateur : **<@${u}>,**\nPseudo : **${n}**\nDescription : **${d}**,\nPrix : **${p}$**.`).setColor("RED").setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1").setTimestamp().setThumbnail(message.guild.iconURL)
                                m.delete().then(message.channel.send(achat).then(async (m) => {
                                    await m.react("✅")
                                    await m.react("❌")
                                    m.awaitReactions(rfilter, {
                                        max: 1,
                                        time: 300000,
                                        errors: ['time']
                                    }).then(collected => {  
                                        const reaction = collected.first()
                                        if(reaction.emoji.name === "✅"){
                                            message.channel.send(`La commande de <@${u}> a belle et bien été enregistrée auprès des vendeurs <@${i}> ! :white_check_mark:`).then(message.guild.channels.find("id", "695337303249387562").send(nc).then(async (m) => {
                                                db.get('commandes').push({id: u, name: n, desc: d, prix: p, msg: m.id}).write()
                                            })).catch((e) => {
                                                m.edit(`:x: La demande a malheureusement été annulée car vous avez mis trop de temps <@${i}> ! ||(5 minutes)||`);
                                                console.log(e)
                                            });
                                        }
                                        else if(reaction.emoji.name === "❌"){
                                            message.channel.send(`L'envoi de la commande de <@${u}> a belle et bien été annulée <@${i}> ! :white_check_mark:`)
                                        }
                                    })
                                }))
                            })
                        })
                    })
                }).catch((e) => {
                    m.edit(`:x: La demande a malheureusement été annulée car vous avez mis trop de temps <@${i}> ! ||(5 minutes)||`);
                    console.log(e)
                });
            })
        }).catch((e) => {
            m.edit(`:x: La demande a malheureusement été annulée car vous avez mis trop de temps <@${i}> ! ||(5 minutes)||`);
            console.log(e)
        });
    }
    if(message.content.startsWith(prefix + "blacklist")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        let args = message.content.split(" ").slice(1)
        args[0] = message.mentions.members.first()
        var u = args[0] 
        if(!message.member.hasPermission("VIEW_AUDIT_LOG")) return message.channel.send("Vous n'avez pas la permission d'effectuer cette commande ! :x:")
        if(!u) return message.channel.send("Veuillez mentionner un utilisateur ! :x:")
        else{
            db.get("blacklist").push({id: u.id}).write()
            message.channel.send(`<@${u.id}> a bien été blacklist du market ! :white_check_mark:`)
        }
    }
    if(message.content.startsWith(prefix + "pardon")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        let args = message.content.split(" ").slice(1)
        args[0] = message.mentions.members.first()
        var u = args[0] 
        if(!message.member.hasPermission("VIEW_AUDIT_LOG")) return message.channel.send("Vous n'avez pas la permission d'effectuer cette commande ! :x:")
        if(!u) return message.channel.send("Veuillez mentionner un utilisateur ! :x:")
        else{
            db.get("blacklist").pop({id: u.id}).write()
            message.channel.send(`<@${u.id}> a bien été retiré de la blacklist du market ! :white_check_mark:`)
        }
    }

    if(message.content.startsWith(prefix + "achat")){        
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        message.delete()
        const i = `${message.author.id}` 
        if(db.get("commandes").find({id: i}).value()){
            message.channel.send(`Vous avez déjà la commande #${i} en cours, pour toute annulation veuillez entrer la commande : ` + "`" + prefix + "reset` !" )
            return;
        }
        const filter = response => {
            return response.author.id === Authorid;
        }
        const rfilter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        message.channel.send(`Veuillez entrer votre pseudo en jeu <@${i}>.\n:warning: À LA LETTRE PRÈS, SI VOUS VOUS TROMPEZ RECOMMENCEZ !`).then((m) => {
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 300000,
                errors: ['time'],
            }).then(collected => {
                const name = collected.first()
                message.channel.bulkDelete(1)
                m.edit(`Veuillez entrer la description de votre commande <@${i}>.`).then((m) => {
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 300000,
                        errors: ['time'],
                    }).then(collected => {
                        const msge = collected.first()
                        message.channel.bulkDelete(1)
                        m.edit(`Veuillez entrer un prix <@${i}>, **seulement des nombre** s'il vous plaît.`).then((m) => {
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 300000,
                                errors: ['time'],
                            }).then((collected) => {
                                message.channel.bulkDelete(1)
                                var prix = collected.first()
                                const p = `${prix}`
                                const d = `${msge}`
                                const n = `${name}`
                                if(!(p.includes("k") || p.includes("K") || p.includes(".") || p.includes(" "))){
                                    if(isNaN(p)){
                                        m.edit(`Commande annulée, car vous n'avez pas indiqué un prix éligible <@${i}> ! :x:`)
                                        return;
                                    }
                                }
                                let achat = new Discord.RichEmbed().setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL).setTitle("**[:shopping_cart:] ACHAT / COMMANDE**").setDescription("**— — — — (`"+ prefix + "achat`) — — — —**").addField("**__Récapitulatif de votre commande,__**\n**`Veuillez confirmer ou non l'envoi de celle-ci afin qu'un vendeur puisse l'a prendre en charge.`**", `COMMANDE-**#${i}**\nUtilisateur : **<@${i}>,**\nPseudo : **${n}**\nDescription : **${d}**,\nPrix : **${p}$**.`)                .setColor("RED").setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1").setTimestamp().setThumbnail(message.guild.iconURL)
                                let nc = new Discord.RichEmbed().setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL).setTitle("**[:shopping_cart:] NOUVELLE COMMANDE**").setDescription("**— — — — (`"+ prefix + "commande #<identifiant>`) — — — —**").addField("**Nouvelle commande !**", `COMMANDE-**#${i}**\nUtilisateur : **<@${i}>,**\nPseudo : **${n}**\nDescription : **${d}**,\nPrix : **${p}$**.`).setColor("RED").setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1").setTimestamp().setThumbnail(message.guild.iconURL)
                                m.delete().then(message.channel.send(achat).then(async (m) => {
                                    await m.react("✅")
                                    await m.react("❌")
                                    m.awaitReactions(rfilter, {
                                        max: 1,
                                        time: 300000,
                                        errors: ['time']
                                    }).then(collected => {  
                                        const reaction = collected.first()
                                        if(reaction.emoji.name === "✅"){
                                            message.channel.send(`Votre commande a belle et bien été enregistrée auprès des vendeurs <@${i}> ! :white_check_mark:`).then(message.guild.channels.find("id", "695337303249387562").send(nc).then(async (m) => {
                                                db.get('commandes').push({id: i, name: n, desc: d, prix: p, msg: m.id}).write()
                                            })).catch((e) => {
                                                m.edit(`:x: La demande a malheureusement été annulée car vous avez mis trop de temps <@${i}> ! ||(5 minutes)||`);
                                                console.log(e)
                                            });
                                        }
                                        else if(reaction.emoji.name === "❌"){
                                            message.channel.send(`Votre commande a belle et bien été annulée <@${i}> ! :white_check_mark:`)
                                        }
                                    })
                                }))
                            })
                        })
                    })
                }).catch((e) => {
                    m.edit(`:x: La demande a malheureusement été annulée car vous avez mis trop de temps <@${i}> ! ||(5 minutes)||`);
                    console.log(e)
                });
            })
        }).catch((e) => {
            m.edit(`:x: La demande a malheureusement été annulée car vous avez mis trop de temps <@${i}> ! ||(5 minutes)||`);
            console.log(e)
        });
    }
    if(message.content.startsWith(prefix + "test")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        let args = message.content
        let cmd = args.replace(prefix + "test", "")
        let all = cmd.replace(" ", "")
        let email = `${all}`
        async function isMailCorrupted(){
            let filehandle = null;
            var contents = fs.readFileSync('accounts.txt', 'utf8');
            var line = contents.includes(`${email}`)
            if(!(contents.includes('@') && contents.includes("."))) return message.channel.send("Vous n'avez pas entré d'email")
            if(message.author.id === bot.user.id) return;
            if (line){
                await message.channel.send('email corrompus!')
            }
            else{
                await message.channel.send('email non corrompus')
            }
        }
        isMailCorrupted()
    }
    if(message.content.startsWith(prefix + "reset")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        let args = message.content.split(" ").slice(1)
        args[0] = message.mentions.members.first()
        var u = args[0] 
        function DeleteMessage(){
            var mid = db.get("commandes").find({id: message.author.id}).get("msg").value()
            if(u){
                mid = db.get("commandes").find({id: u.id}).get("msg").value()
            }
            let msg = `${mid}`
            message.guild.channels.find("id", "695337303249387562").fetchMessage(msg).then(msg => msg.delete()).catch(console.error)
        }
        var delmsg = DeleteMessage();
        if(!u){
            if(db.get("commandes").find({id: message.author.id}).value()){
                db.get("commandes").pop({id: message.author.id}).write()
                message.channel.send("Votre commande #" + message.author.id + " a bien été annulée ! :white_check_mark:").then(delmsg)
            }
            else{
                message.channel.send("Vous n'avez pas de commande à annuler ! :x:")
            }
        }
        else {
            if(message.author.id === u.id){
                if(db.get("commandes").find({id: message.author.id}).value()){
                    db.get("commandes").pop({id: message.author.id}).write()
                    message.channel.send("Votre commande #" + message.author.id + " a bien été annulée ! :white_check_mark:").then(delmsg)
                }
                else{
                    message.channel.send("Vous n'avez pas de commande à annuler ! :x:")
                }
            }
            else{
                if(message.member.hasPermission("VIEW_AUDIT_LOG")){
                    if(db.get("commandes").find({id: u.id}).value()){
                        db.get("commandes").pop({id: u.id}).write()
                        message.channel.send(`La commande #${u.id} de <@${u.id}> a bien été annulée ! :white_check_mark:`).then(delmsg)
                    }
                    else{
                        message.channel.send(`<@${u.id}> n'a aucune commande à annuler ! :x:`)
                    }
                }
                else{
                    message.channel.send("Tu n'as pas la permission d'annuler la commande d'un utilisateur ! :x:")
    
                }
            }
        }
    } 
    if(message.content.startsWith(prefix + "commande")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        let args = message.content.split(" ").slice(1).join(" ")
        if(!args) return message.channel.send("Vous n'avez pas entré d'identifiant de commande ! :x:")
        if(!args.includes("#")){
            if(isNaN(args)){
                message.channel.send("Vous n'avez pas entré un bon identifiant de commande ! :x:\nRappel : #<numéro>")
                return
            }
        }
        else if(message.member.hasPermission("VIEW_AUDIT_LOG")){
            const i = args.replace("#", "")
            let d = db.get("commandes").find({id: i}).get("desc").value()
            let p = db.get("commandes").find({id: i}).get("prix").value()
            let n = db.get("commandes").find({id: i}).get("name").value()
            let dm = new Discord.RichEmbed()
            .setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL)
            .setTitle("**[:white_check_mark:] PRISE EN CHARGE D'UNE COMMANDE**")
            .setDescription("**— — — — (`"+ prefix + "commande #<identifiant>`) — — — —**")
            .addField("**`Êtes-vous sûr de vouloir prendre en charge la commande suivante :`**", `COMMANDE-**#${i}**\nUtilisateur : **<@${i}>,**\nPseudo : **${n}**,\nDescription : **${d}**,\nPrix : **${p}$**.`)                
            .setColor("RED")
            .setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1")
            .setTimestamp()
            .setThumbnail(message.guild.iconURL)
            message.author.send(dm).then(async (m) => {
                await m.react("✅")
                await m.react("❌")
                bot.on("messageReactionAdd", (reaction, user) => {
                    if(user.id === bot.user.id) return;
                    if(reaction.emoji.name === "✅"){
                        message.author.send("Veuillez entrer une date d'estimation pour votre commande").then(async (m) => {
                            const filter = response => {
                                return response.author.id === Authorid;
                            }
                            m.channel.awaitMessages(filter, {
                                max: 1,
                                time: 300000,
                                errors: ['time'],
                            }).then(async collected => {
                                const msge = collected.first()
                                const t = `${msge}`
                                function DeleteCommandMessage(){
                                    mid = db.get("commandes").find({id: i}).get("msg").value()
                                    let msg = `${mid}`
                                    message.guild.channels.find("id", "695337303249387562").fetchMessage(msg).then(msg => msg.delete()).catch(console.error)
                                }
                                var delcmdmsg = DeleteCommandMessage();
                                let cu = new Discord.RichEmbed()
                                .setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL)
                                .setTitle("**[:white_check_mark:] PRISE EN CHARGE D'UNE COMMANDE**")
                                .setDescription("**— — — — (`"+ prefix + "commande #<identifiant>`) — — — —**")
                                .addField("**`Mise à jour d'une commande !`**", `COMMANDE-**#${i}**\nAcheteur : **<@${i}> (${n}),**\nVendeur : **<@${message.author.id}>**,\nDate d'estimation : **${t}**.`)                
                                .setColor("RED")
                                .setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1")
                                .setTimestamp()
                                .setThumbnail(message.guild.iconURL)
                                message.author.send("Votre prise en charge a bien été transmise à l'acheteur !").then(e => {
                                    delcmdmsg
                                })
                                await message.guild.channels.find("id", "697431477222244402").send(`Nouvelle mise à jour de commande <@${i}> !`)
                                await message.guild.channels.find("id", "697431477222244402").send(cu).catch(console.error)
                                db.get("commandes").pop({id: i}).write()
                            })
                        })
                    }
                    else if(reaction.emoji.name === "❌"){
                        message.author.send("Votre prise en charge a bien été annulée ! :white_check_mark:")
                    }
                })
            }).catch((e) => {
                message.channel.send("Vos MP sont fermés, ouvrez les si vous voulez utiliser cette fonctionnalité ! :x:")
                console.log(e)
            })
        }
        else {
            message.channel.send("Vous n'avez pas la permission d'utiliser cette commande ! :x:")
        }
    }
    if(message.content.startsWith(prefix + "kill")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        if(message.member.hasPermission("ADMINISTRATOR")){
            message.channel.send("Le bot a été redémarré avec succès ! :white_check_mark:")
            process.exit();
        }
    }
    if(message.content.startsWith(prefix + "help")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        let help = new Discord.RichEmbed()
            .setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL)
            .setTitle("**[:question:] PAGE D'AIDE**")
            .setDescription("**— — — — (`" + prefix + "help`) — — — —**")
            .addField("`Voici les commandes disponibles`\n**__ACHETEUR__**", "`" + prefix + "achat` : Enregistrer une commande.\n`" + prefix + "reset` : Annuler votre commande.\n`" + prefix + "infos` : Afficher les informations d'une commande.\n`" + prefix + "help` : Afficher cette page.")                
            .addField("**__VENDEUR__**", "`" + prefix + "reset @Utilisateur` : Annuler la commande d'un utilisateur.\n`" + prefix + "commande` : Prendre en charge une commande.\n`" + prefix + "blacklist` : Mettre un utilisateur dans la blacklist.\n`" + prefix + "admin-achat` : Faire une commande à la place d'un utilisateur.")                
            .setColor("RED")
            .setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1")
            .setTimestamp()
            .setThumbnail(message.guild.iconURL)
        message.channel.send(help) 
    }
    if(message.content.startsWith(prefix + "liste")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        message.channel.send(":warning: Commande en construction :warning:")
    }
    if(message.content.startsWith(prefix + "infos")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        message.delete()
        let args = message.content.split(" ").slice(1).join(" ")
        if(!args) return message.channel.send("Vous n'avez pas entré d'identifiant de commande ! :x:")
        if(!args.includes("#")){
            if(isNaN(args)){
                message.channel.send("Vous n'avez pas entré un bon identifiant de commande ! :x:\nRappel : #<numéro>")
                return
            }
        }
        const i = args.replace("#", "")
        let d = db.get("commandes").find({id: i}).get("desc").value()
        let p = db.get("commandes").find({id: i}).get("prix").value()
        let n = db.get("commandes").find({id: i}).get("name").value()
        let infos = new Discord.RichEmbed()
        .setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL)
        .setTitle("**[📡] INFORMATIONS D'UNE COMMANDE**")
        .setDescription("**— — — — (`"+ prefix + "infos #<identifiant>`) — — — —**")
        .addField("**`Voici les informations de la commande donnée :`**", `COMMANDE-**#${i}**\nUtilisateur : **<@${i}>,**\nPseudo : **${n},**\nDescription : **${d}**,\nPrix : **${p}$**.`)                
        .setColor("RED")
        .setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1")
        .setTimestamp()
        .setThumbnail(message.guild.iconURL)
        message.channel.send(infos)
    }
})

bot.on('ready', () => {
    console.log(figlet.textSync(".[ MARKETDOWN ].\nBY NYROK").red);
    let statues = ["@Nyrok10 on Twitter", "NeverDown Market © 2020", "♜ discord.gg/bKSxrXR ♜", "/help pour afficher la page d'aide", "/achat pour commander"];
    setInterval(function(){
    let status = statues[Math.floor(Math.random()*statues.length)];
        bot.user.setActivity(status, {type: "LISTENING"});
        bot.user.setStatus("dnd");
    }, 3000)
})