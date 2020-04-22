const Discord = require("discord.js")
const bot = new Discord.Client()
const fs = require("fs")
const figlet = require('figlet');
const colors = require('colors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync("database.json");
const db = low(adapter)
const prefix = "/";
const token = process.env.TOKEN;
const ms = require("ms")
db.defaults({ commandes: [], encheres: [], surenchere: [], blacklist: []}).write()
bot.login(token)
bot.commands = new Discord.Collection()

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
    if(message.content.startsWith(prefix + "surenchère")){
        const i = `${message.author.id}`
        if(db.get("blacklist").find({id: i}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        if(!db.get("encheres").find({id: message.guild.id}).value()) return message.channel.send("Vous ne pouvez pas surenchérir sans enchère ! :x:");
        let idb = db.get("surenchere").find({gid: message.guild.id}).get("id").value()
        if(idb === i) return message.channel.send("Vous ne pouvez pas surenchérir 2 fois de suite ! :x:")
        let e = db.get("encheres").find({id: message.guild.id}).get("ecart").value()
        let p = db.get("encheres").find({id: message.guild.id}).get("prix").value()
        let d = db.get("encheres").find({id: message.guild.id}).get("desc").value()
        let m = db.get("surenchere").find({gid: message.guild.id}).get("prix").value()
        let args = message.content.split(" ").slice(1);
        let mise = parseInt(args)
        let prix = parseInt(p)
        let ecart = parseInt(e)
        let se = new Discord.RichEmbed()
                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
                .setTitle("**[:money_mouth:] SURENCHÈRE**")
                .setDescription("**— — — — (`" + prefix + "surenchère`) — — — —**")
                .setThumbnail(message.guild.iconURL)
                .setColor("RED")
                .setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png")
                .addField(`**__Nouvelle surenchère !__**`, `Utilisateur : <@${i}>,\nDescription : **${d}**,\nMise : **${mise}$**,\nPrix de départ : **${prix}$**,\nSurenchère minimum : **${ecart}$**.`)
                .setTimestamp()
        if(!mise) return message.channel.send("Vous n'avez pas entré de prix ! :x:"); 
        if(isNaN(mise)) return message.channel.send("Vous n'avez pas entré de prix éligible ! :x:")
        if(!db.get("surenchere").find({gid: message.guild.id}).value()){
            let prix = parseInt(p)
            let ecart = parseInt(e)
            let pe = ecart + prix
            if(args < pe) return message.channel.send(`La surenchère minimum est de ${pe} !`)
            db.get("surenchere").push({gid: message.guild.id, id: i, prix: mise}).write()
            message.channel.send(`:white_check_mark: Votre mise de **${mise}** a bien été prise en compte pour l'enchère de : **${d}**`)
            message.guild.channels.find('id', "694920420607918180").send(se)
        }
        else{
            let min = m + ecart
            if(mise < min) return message.channel.send("Vous devez miser plus gros que " + min + " ! :x:")
            message.channel.send(`:white_check_mark: Votre mise de **${mise}** a bien été prise en compte pour l'enchère de : **${d}**`).then(async (m) => {
                await db.get("surenchere").pop({gid: message.guild.id}).write()
                await db.get("surenchere").push({gid: message.guild.id, id: i, prix: mise}).write()
                await message.guild.channels.find('id', "694920420607918180").send(se)
            })
        }
        
    }
    if(message.content.startsWith(prefix + "enchère")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        if(!message.member.hasPermission("VIEW_AUDIT_LOG")) return message.channel.send("Vous n'avez pas la permission d'effectuer cette commande ! :x:")
        message.delete()
        const i = `${message.author.id}` 
        if(db.get("encheres").find({id: message.guild.id}).value()){
            message.channel.send(`Il y'a déjà une enchère en cours <@${i}>`)
            return;
        }
        const filter = response => {
            return response.author.id === Authorid;
        }
        message.channel.send(`Veuillez entrer la description de votre enchère <@${i}>.`).then((m) => {
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 300000,
                errors: ['time'],
            }).then(collected => {
                const desc = collected.first()
                message.channel.bulkDelete(1)
                m.edit(`Veuillez entrer le prix de départ de votre enchère <@${i}>.`).then((m) => {
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 300000,
                        errors: ['time'],
                    }).then((collected) => {
                        const prix = collected.first()
                        if(isNaN(prix)) return message.channel.send("Vous n'avez pas indiquer un prix de départ éligible ! :x:")
                        message.channel.bulkDelete(1)
                        m.edit(`Veuillez entrer la surenchère minimum de votre enchère <@${i}>.`).then((m) => {
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 300000,
                                errors: ['time'],
                        }).then((collected) => {
                            const ecart = collected.first()
                            if(!ecart) return message.channel.send("Vous n'avez pas entré un bon prix, format :\n1y, 1d, 1h, 1m, 1s")
                            if(isNaN(ecart)) return message.channel.send("Vous n'avez pas indiquer d'écart de prix éligible ! :x:")
                            message.channel.bulkDelete(1)
                            m.edit(`Veuillez entrer la durée de votre enchère <@${i}>.`).then((m) => {
                                message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 300000,
                                errors: ['time'],
                            }).then((collected) => {
                                const temps = collected.first()
                                const d = `${desc}`
                                const p = `${prix}`
                                const e = `${ecart}`
                                const t = `${temps}`
                                if(!(t.includes("d") || t.includes("h") || t.includes("m") || t.includes("s"))){
                                    if(isNaN(temps)) return message.channel.send("Vous n'avez pas indiquer de temps éligible ! :x:")
                                }
                                t.replace("d", " jours")
                                t.replace("h", " heures")
                                t.replace("s", " secondes")
                                t.replace("m", " minutes")
                                message.channel.bulkDelete(1)
                                let enchere = new Discord.RichEmbed().setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL).setTitle("**[:money_mouth:] ENCHÈRE**").setDescription("**— — — — (`"+ prefix + "enchère`) — — — —**").addField("**__Récapitulatif de votre enchère :__**", `Utilisateur : **<@${i}>,**\nDescription : **${d}**,\nPrix de départ : **${p}$**,\nSurenchère minimum : **${e}$**,\nDurée : **${t}**.`).setColor("RED").setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1").setTimestamp().setThumbnail(message.guild.iconURL)
                                message.guild.channels.find("id", "694920420607918180").send(enchere).then((msg) => {
                                    setTimeout(async function(){ 
                                        let mid = db.get("surenchere").find({gid: message.guild.id}).get("prix").value()
                                        let a = db.get("surenchere").find({gid: message.guild.id}).get("id").value()
                                        let hdv = new Discord.RichEmbed().setAuthor(message.author.username + '#' + message.author.discriminator, message.author.displayAvatarURL).setTitle("**[:money_mouth:] FIN DE L'ENCHÈRE**").setDescription("**— — — — (`"+ prefix + "enchère`) — — — —**").addField("**__L'enchère est terminé !__**", `Utilisateur : **<@${i}>,**\nDescription : **${d}**,\nPrix de départ : **${p}$**,\nGagnant : <@${a}>,\nPrix final : **${mid}$**.`).setColor("RED").setFooter("@Nyrok10 on Twitter", "https://cdn.discordapp.com/emojis/590848931852713984.png?v=1").setTimestamp().setThumbnail(message.guild.iconURL)
                                        msg.delete()
                                        await message.guild.channels.find("id", "694920420607918180").send(hdv)
                                        await message.guild.channels.find("id", "694920420607918180").send(`<@${a}> Félicitations, vous avez remporté l'enchère, vous avez **24 heures** pour régler **${mid}** pour ensuite recevoir : **${d}$** !`)
                                        await db.get("encheres").pop({id: message.guild.id}).write()
                                        await db.get("surenchere").pop({gid: message.guild.id}).write()
                                    }, ms(t));
                                })
                                m.edit(`Votre enchère à bien été lancée dans <#694920420607918180> ! <@${i}>`)
                                db.get("encheres").push({id: message.guild.id, desc: d, prix: p, ecart: e}).write()
                            })
                        })
                    })
                })      
                    })
                })    
            })
        })
    }
    if(message.content.startsWith(prefix + "fin")){
        if(db.get("blacklist").find({id: message.author.id}).value()) return message.channel.send("Tu es blacklist du market ! :no_entry_sign:");
        if(!message.member.hasPermission("VIEW_AUDIT_LOG")) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande ! :x:")
        let args = message.content.split(" ").slice(1)
        const id = `${args}`
        const i = id.replace("#", "")
        if(!i) return message.channel.send("Vous n'avez pas entré d'identifiant de commande ! :x:")
        if(isNaN(i)){
            message.channel.send("Vous n'avez pas entré un bon identifiant de commande ! :x:\nRappel : " + prefix + "fin #<numéro>")
            return;
        }
        message.channel.send("La finition de votre commande a bien été envoyé à l'acheteur ! :white_check_mark:")
        message.guild.fetchMember(i).then((auth) => {
            auth.send(`Votre commande #${i} est prête ! Prise par ${message.author.tag}`).catch((e) => { message.channel.send(`<@${i}> a bloqué ses messages privés ! :x:`) })
            db.get("commandes").pop({id: i}).write()
        })
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
            .addField("`Voici les commandes disponibles`\n**__ACHETEUR__**", "`" + prefix + "achat` : Enregistrer une commande.\n`" + prefix + "reset` : Annuler votre commande.\n`" + prefix + "infos #<commande>` : Afficher les informations d'une commande.\n`" + prefix + "surenchère <montant>` : Surenchérir une enchère.\n`" + prefix + "help` : Afficher cette page.")                
            .addField("**__VENDEUR__**", "`" + prefix + "reset @Utilisateur` : Annuler la commande d'un utilisateur.\n`" + prefix + "enchère` : Créer une enchère.\n`" + prefix + "commande #<commande>` : Prendre en charge une commande, l'a mettre en staut : `EN COURS`.\n`" + prefix + "blacklist @Utilisateur` : Mettre un utilisateur dans la blacklist.\n`" + prefix + "pardon @Utilisateur` : Retirer un utilisateur de la blacklist.\n`" + prefix + "fin #<commande>` : Mettre une commande en statut : `Terminé`.\n`" + prefix + "admin-achat @Utilisateur` : Faire une commande à la place d'un utilisateur.")                
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