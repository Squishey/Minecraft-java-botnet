const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow
const pvp = require('mineflayer-pvp').plugin
const botManager = require('./botManager');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class bot{
  constructor(name, ip, port, options = { connections: 0, whitelist: ['Squisheyyy'] }){
    this.name = name;
    this.ip = ip;
    this.port = port
    this.connections = options.connections;
    this.selfMode = false;
    this.whitelist = options.whitelist;

    this.minebot = mineflayer.createBot({
      host: this.ip,
      username: this.name,
      port: this.port
    })

    this.minebot.loadPlugin(pathfinder);
    this.minebot.loadPlugin(pvp);

    this.minebot.on('login', () => {
      for(let i = 0; i < 1; i++){
        this.minebot.chat(this.name);
      }
    })

    this.minebot.on('kicked', () => {
      let time = getRandomInt(1800, 3500);
      if(this.connections >= 5) {console.log(`${this.username} fully disconnected`); return;}
      console.log('Connection closed, retrying');
      setTimeout(() => {
        new bot(this.name, this.ip, this.port, {connections: this.connections + 1});
        delete this;
      }, time)
    });

    this.minebot.on('end', () => {
      let time = getRandomInt(1800, 3500);
      if(this.connections >= 5) {console.log(`${this.username} fully disconnected`); return;}
      console.log('Connection closed, retrying');
      setTimeout(() => {
        new bot(this.name, this.ip, this.port, {connections: this.connections + 1});
        delete this;
      }, time)
    });

    this.minebot.on('error', () => {
      let time = getRandomInt(1800, 3500);
      console.log(this.connections);
      if(this.connections >= 5) {console.log(`${this.username} fully disconnected`); return;}
      console.log('Connection closed, retrying');
      setTimeout(() => {
        new bot(this.name, this.ip, this.port, {connections: this.connections + 1});
        delete this;
      }, time)
    });

    this.minebot.on('chat', (user, msg) => {
      for(let i = 0; i < this.whitelist.length; i++){
          if( user === this.whitelist[i] & this.selfMode ){
              let separatedCommand = msg.split(' ')
              switch(separatedCommand[0].toLowerCase()){
                  case 'follow':
                      console.log('a');
                      this.followPlayer(separatedCommand[1]);
                      break;
                  case 'idle':
                      this.idle();
                      break;
                  case 'attack':
                      this.attack(separatedCommand[1]);
                      break;
                  case 'leaveall':
                      this.disconnect();
                      break;
                  case 'whereare':
                      this.whereis(separatedCommand[1])
                      break;
                  case 'whitelist':
                      console.log(separatedCommand[1], separatedCommand[2]);
                      this.whitelistHandler(separatedCommand[1], separatedCommand[2]);
                      break;
              }
          }
      }
    })
  }

  whitelistHandler(arg, name){
    if(arg !== undefined){
      switch(arg){
        case 'add':
          this.whitelist.push(name);
          break;
        case 'remove':
          for(let i = 0; i < this.whitelist.length; i++){
            if(this.whitelist[i] === name){
              this.whitelist.splice(i, 1);
              this.minebot.chat(`Removed ${name}`);
              return;
            }
          }
          this.minebot.chat('Couldnt find them');
      }
    }
    else{
      this.minebot.chat(this.whitelist.toString());
    }
  }

  whereis(){
    this.minebot.chat(this.minebot.entity.position.toString());
  }
  
  disconnect(){
      this.minebot.quit();
  }

  idle(){
      this.minebot.pathfinder.setGoal(null);
      this.minebot.pvp.attack(null);
  }

  attack(name){
      this.minebot.pathfinder.setGoal(null);
      let player = this.minebot.players[name];

      if(!player){
        if(this.selfMode){
          this.minebot.chat('Couldnt find that player');
        }
        return 0;
      };
      this.minebot.pvp.attack(player.entity);
      if(this.selfMode){ this.minebot.chat('Going for that player') };
      return 1;
  }

  followPlayer(name){
    const playerCI = this.minebot.players[name];

    if(!playerCI){
        if(this.selfMode){
          this.minebot.chat('Couldnt find that player');
        }
        return 0;
    }

    const mcData = require('minecraft-data')(this.minebot.version);
    const movements = new Movements(this.minebot, mcData);
    this.minebot.pathfinder.setMovements(movements);

    const goal = new GoalFollow(playerCI.entity, 1);
    this.minebot.pathfinder.setGoal(goal, true);
    if(this.selfMode){
      this.minebot.chat('Following them');
    }
    return 1;
  }

  selfModeFunction(){
    this.selfMode = true;
  }

}

module.exports = bot;