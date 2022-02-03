const mineflayer = require('mineflayer')
const bot = require('./bot');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

class botManager{
    constructor(name, startWith, ip, port){
        this.name = name;
        this.startWith = startWith;
        this.ip = ip;
        this.port = port;
        this.bots = []
        this.allowedNames = ['Squisheyyy']

        this.bot = mineflayer.createBot({
            host: this.ip,
            username: this.name,
            port: this.port 
        });

        this.bot.on('spawn', () => {
            for(let i = 0; i < this.startWith; i++){
                setTimeout(() => {
                    let name = this.name + getRandomInt(100, 13400);
                    this.bots.push( new bot(name, this.ip, this.port) )
                }, 4000 * i)
            }
        })

        this.bot.on('chat', (user, msg) => {
            for(let i = 0; i < this.allowedNames.length; i++){
                if( user === this.allowedNames[i] ){
                    let separatedCommand = msg.split(' ')
                    switch(separatedCommand[0].toLowerCase()){
                        case 'seguir':
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
                            this.leaveAll();
                            break;
                        case 'whereis':
                            this.whereis(separatedCommand[1])
                            break;
                    }
                }
            }
        })
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
        this.bot.disconnect();
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
                this.bot.chat(`${this.bots[i].name} no encuentra a ese jugador`);
            }
            else{
                success++
            }
        }
        this.bot.chat(`${success}/${this.bots.length} lo estan persiguiendo para matarlo`)
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
                this.bot.chat(`${this.bots[i].name} no encuentra a ese jugador`);
            }
            else{
                success++
            }
        }
        this.bot.chat(`${success}/${this.bots.length} lo estan siguiendo`)
    }
}

module.exports = botManager;