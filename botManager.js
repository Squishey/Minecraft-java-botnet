const mineflayer = require('mineflayer')
const bot = require('./bot');
const fs = require('fs');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

class botManager{
    constructor(name, startWith, ip, port, options = { connections: 0, bots: [] }){
        this.name = name;
        this.startWith = startWith;
        this.ip = ip;
        this.port = port;
        this.bots = options.bots
        this.allowedNames = ['Squisheyyy'] // Your minecraft user here
        this.connections = options.connections;

        this.bot = mineflayer.createBot({
            host: this.ip,
            username: this.name,
            port: this.port 
        });

        this.bot.on('kick', () => {
            if(this.connections >= 2){
                console.log('Manager died, changing bots to self mode');
                for(let i = 0; i < this.bots.length; i++){
                    this.bots[i].selfModeFunction();
                    delete this;
                }
            }
            else{
                new botManager(this.name, 0, this.ip, this.port, { connections: this.connections + 1, bots: this.bots });
                delete this;
            }
        })

        this.bot.on('end', () => {
            if(this.connections >= 2){
                console.log('Manager died, changing bots to self mode');
                for(let i = 0; i < this.bots.length; i++){
                    try{
                        this.bots[i].selfModeFunction();
                    }
                    catch(e){ console.log(e) }
                }
            }
            else{
                new botManager(this.name, 0, this.ip, this.port, { connections: this.connections + 1, bots: this.bots });
                console.log(this.connections);
                delete this;
            }
        })

        this.bot.on('error', () => {
            if(this.connections >= 2){
                console.log('Manager died, changing bots to self mode');
                for(let i = 0; i < this.bots.length; i++){
                    this.bots[i].selfModeFunction();
                }
            }
            else{
                console.log(this.connections)
                new botManager(this.name, 0, this.ip, this.port, { connections: this.connections + 1, bots: this.bots });
                delete this;
            }
        })

        this.bot.on('login', () => {
            if(this.bots.length >= 1){
                this.bot.chat(`Successfully restored ${this.bots.length} bots.`);
                return;
            }
            for(let i = 0; i < this.startWith; i++){
                setTimeout(() => {
                    let name = this.name + getRandomInt(0, 134000);
                    this.bots.push( new bot(name, this.ip, this.port) )
                }, 4000 * i)
            }
        })

        this.bot.on('chat', (user, msg) => {
            for(let i = 0; i < this.allowedNames.length; i++){
                if( user === this.allowedNames[i] ){
                    let separatedCommand = msg.split(' ')
                    switch(separatedCommand[0].toLowerCase()){
                        case 'follow':
                            console.log('a');
                            this.follow(separatedCommand[1]);
                            break;
                        case 'addbot':
                            console.log('??')
                            this.addBot(separatedCommand[1]);
                            break;
                        case 'idle':
                            this.idle();
                            break;
                        case 'attack':
                            this.attack(separatedCommand[1]);
                            break;
                        case 'leave':
                            this.leave(separatedCommand[1]);
                            break;
                        case 'leaveall':
                            this.leaveAll();
                            break;
                        case 'terminate':
                            this.terminate();
                            break;
                        case 'whereis':
                            this.whereis(separatedCommand[1])
                            break;
                        case 'whitelist':
                            console.log(separatedCommand[1], separatedCommand[2]);
                            this.whitelist(separatedCommand[1], separatedCommand[2]);
                            break;
                    }
                }
            }
        })
    }

    whitelist(arg, name){
        if(arg !== undefined){
            switch(arg){
                case 'add':
                    this.allowedNames.push(name);
                    this.bot.chat(`${name} has been successfully added to whitelist`);
                    break;
                case 'remove':
                    for(let i = 0; i < this.allowedNames.length; i++){
                        if(name === this.allowedNames[i]){
                            this.allowedNames.splice(i, 1);
                            this.bot.chat(`${name} has been successfully removed from whitelist`);
                            return;
                        }
                    }
                    this.bot.chat('Unknown player')
                    break;
            }
        }
        else{
            this.bot.chat(`${this.allowedNames.toString()}`);
        }
    }

    whereis(botName){
        for(let i = 0; i < this.bots.length; i++){
            console.log(botName, this.bots[i].name);
            if(this.bots[i].name === botName){
                let coords = this.bots[i].minebot.entity.position
                this.bots[i].minebot.chat(`I am at ${coords}`);
                return;
            }
        }
        this.bot.chat('Couldnt find that bot')
    }

    leaveAll(){
        for(let i = 0; i < this.bots.length; i++){
            this.bots[i].disconnect();
            this.bots = []
        }
    }

    terminate(){
        for(let i = 0; i < this.bots.length; i++){
            this.bots[i].disconnect();
            this.bots = []
        }
        this.bot.quit();
    }

    leave(botName){
        for(let i = 0; i < this.bots.length; i++){
            if(this.bots[i].name === botName){
                this.bots[i].disconnect();
                this.bots.splice(i, 1);
                this.bot.chat('Success');
                return
            }
        }
        this.bot.chat('Unknown bot');
    }

    addBot(name){
        this.bots.push(new bot(name, this.ip, this.port))
        this.bot.chat(`${name} is joining`)
    }

    attack(player){
        let success = 0;
        for(let i = 0; i < this.bots.length; i++){
            if(this.bots[i].attack(player) === 0){
                this.bot.chat(`${this.bots[i].name} cant find that player`);
            }
            else{
                success++
            }
        }
        this.bot.chat(`${success}/${this.bots.length} are following ${player} in order to kill them`)
    }

    idle(){
        for(let i = 0; i < this.bots.length; i++){
            this.bots[i].idle();
        }
    }

    follow(player){
        let success = 0
        for(let i = 0; i < this.bots.length; i++){
            if(this.bots[i].followPlayer(player) === 0){
                this.bot.chat(`${this.bots[i].name} cant find that player`);
            }
            else{
                success++
            }
        }
        this.bot.chat(`${success}/${this.bots.length} are following them`)
    }
}

module.exports = botManager;