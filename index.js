const Discord = require('discord.js'); //Require discord.js
var fs = require('fs'); //Require fs

const client = new Discord.Client(); //Intialize Discord client

function delData(id) {
    if (!fs.existsSync("data.json")) { //If data.json doesn't exist, create it with an empty object as content.
        fs.writeFileSync("data.json", JSON.stringify({}), "UTF-8");
    }
    var content = fs.readFileSync("data.json", "UTF-8"); //Read data.json file
    var object = JSON.parse(content); //Parse data.json
    if (typeof object[id] != "undefined"){
        delete object[id];
        fs.writeFileSync("data.json", JSON.stringify(object), "UTF-8"); //Write new object to data.json
    }
}

function readData() {
    if (!fs.existsSync("data.json")) { //If data.json doesn't exist, create it with an empty object as content.
        fs.writeFileSync("data.json", JSON.stringify({}), "UTF-8");
    }
    var content = fs.readFileSync("data.json", "UTF-8"); //Read data.json file
    var object = JSON.parse(content); //Parse data.json
    return object;
}

function writeData(object) {
    if (!fs.exists("data.json")) { //If data.json doesn't exist, create it with an empty object as content.
        fs.writeFileSync("data.json", JSON.stringify({}), "UTF-8");
    }
    var content = fs.readFileSync("data.json", "UTF-8"); //Read data.json file
    var fileObject = JSON.parse(content); //Parse file
    Object.keys(object).forEach(function (element) { //Copy stuff from input object to file object
        fileObject[element] = object[element];
    });
    fs.writeFileSync("data.json", JSON.stringify(fileObject), "UTF-8"); //Write new object to data.json
}

client.on('ready', () => { //On successful login
    console.log("Up and running!");
    client.user.setGame("with roles"); //Set the "Playing" text
});

client.on('message', message => { //On a new message
    if (message.content.startsWith("!claim ")) {
        if (message.channel.type != "dm") {
            var data = readData();
            if (typeof data[message.guild.id] == "undefined") {
                if (message.member.hasPermission("MANAGE_SERVER")) {
                    var newData = {};
                    var idString = message.content.substr("!claim ".length, message.content.length).trim();
                    var ids = idString.split(",");
                    ids.forEach(function (element, index) {ids[index] = element.trim()});
                    newData[message.guild.id] = {
                        roles: ids
                    }
                    writeData(newData);
                    message.reply("Success!").then(function(newMessage){
                        newMessage.delete(5000);
                    });
                    message.delete(5000);
                } else {
                    message.reply("You need the manage server permission to do this.");
                }
            } else {
                var roleName = message.content.substr("!claim ".length, message.content.length).trim();
                var roleObject = message.guild.roles.find("name", roleName.trim());
                var abcd = [];
                if (typeof roleObject != "undefined" && roleObject != null) {
                    var roleAllowed = false;
                    console.log(JSON.stringify(data[message.guild.id].roles));
                    data[message.guild.id].roles.forEach(function (element) {
                        if (element == roleObject.id) {
                            console.log(element + ":" + roleObject.id + " tick");
                            roleAllowed = true;
                        } else {
                            console.log(element + ":" + roleObject.id + " X");
                        }
                    });
                    if (roleAllowed) {
                        message.member.addRole(roleObject);
                        message.reply("Added role!");
                    } else {
                        message.reply("Role not allowed.");
                    }
                } else {
                    message.reply("Role `" + roleName + "` not found.");
                }
            }
        } else {
            message.channel.send("You can only use this command in guilds.");
        }
    } else if (message.content.trim() == "!claimreset") {
        if (message.channel.type != "dm") {
            if (message.member.hasPermission("MANAGE_SERVER")){
                delData(message.guild.id);
                message.author.send("Deleted claim data for server.\nRun `!claimsetup` to see the role IDs to set the server up again.\nIf you want to say goodbye, feel free to just kick me now.");
                message.delete();
            } else {
                message.reply("You don't have permission to do that.");
            }
        } else {
            message.channel.send("You can only use this command in guilds.");
        }
    } else if (message.content.trim() == "!claimsetup") {
        if (message.channel.type != "dm") {
            if (message.member.hasPermission("MANAGE_SERVER")){
                if (typeof readData()[message.guild.id] == "undefined"){
                    var fieldarray = [];
                    message.guild.roles.forEach(function (element, key) {
                        fieldarray.push({
                            name: element.name,
                            value: key,
                            inline: true
                        });
                    });
                    console.log("Sending join message...");
                    message.guild.owner.send({
                        embed: {
                            color: 0x7289DA,
                            title: "Hello! I am claim!claim.",
                            description: "You can use me to make people be able to add general roles to them. For example, if you have a LoL server, and someone likes to play on mid, you can configure that people can add themselves a mid role with `!claim mid`.\n\nYou need to set me up. Below, you can find your role names, and a string of numbers below it. Please run the command `!claim number1,number2,number3,etc.` to tell me what roles should people be able to claim. Don't worry: users won't need to run `!claim number1` to claim x role. They can just say `!claim rolename` and I'll remember it.\n\n**Please run the setup command in the guild.**\n\nYou can use the `!claimreset` command to reset the guild settings.\nYou can use the `!claimsetup` command to send you the setup message again.\nThe `!claimreset` and `!claimsetup` commands can only be ran by users with permission to manage the server.\nThe `!claimsetup` command can only be ran after the `!claimreset` command have been ran, or the bot haven't been set up previously.\n\nIf you have any problem with the bot, send an email to greg@trofix.co",
                            fields: fieldarray
                        }
                    });
                    message.delete();
                } else {
                    message.reply("Your server is already set up. Run `!claimreset` to reset role settings.");
                }
            } else {
                message.reply("You don't have permission to do that.");
            }
        } else {
            message.channel.send("You can only use this command in guilds.");
        }
    }
});

client.on('guildCreate', guild => {
    if (typeof readData()[guild.id] == "undefined") { //If guild hasn't been initialized.
        var fieldarray = [];
        guild.roles.forEach(function (element, key) {
            fieldarray.push({
                name: element.name,
                value: key,
                inline: true
            });
        });
        console.log("Sending join message...");
        guild.owner.send({
            embed: {
                color: 0x7289DA,
                title: "Hello! I am claim!claim.",
                description: "You can use me to make people be able to add general roles to them. For example, if you have a LoL server, and someone likes to play on mid, you can configure that people can add themselves a mid role with `!claim mid`.\n\nYou need to set me up. Below, you can find your role names, and a string of numbers below it. Please run the command `!claim number1,number2,number3,etc.` to tell me what roles should people be able to claim. Don't worry: users won't need to run `!claim number1` to claim x role. They can just say `!claim rolename` and I'll remember it.\n\n**Please run the setup command in the guild.**\n\nYou can use the `!claimreset` command to reset the guild settings.\nYou can use the `!claimsetup` command to send you the setup message again.\nThe `!claimreset` and `!claimsetup` commands can only be ran by users with permission to manage roles.\nThe `!claimsetup` command can only be ran after the `!claimreset` command have been ran, or the bot haven't been set up previously.\n\nIf you have any problem with the bot, send an email to greg@trofix.co",
                fields: fieldarray
            }
        });
    } else {
        guild.owner.send("Hm... someone kicked me from the server without resetting my data.\nI'm back, and I still remember you roles! :smiley:\nIf you want to delete role data, run `!claimreset` to delete the data.");
    }
});

client.login(process.env.CLAIMCLAIM_BOT_TOKEN);