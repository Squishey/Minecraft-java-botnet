const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow
const pvp = require('mineflayer-pvp').plugin

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class bot{
  constructor(name, ip, port, options = { connections: 0 }){
    this.name = name;
    this.ip = ip;
    this.port = port
    this.connections = options.connections;

    this.minebot = mineflayer.createBot({
      host: this.ip,
      username: this.name,
      port: this.port
    })

    this.minebot.loadPlugin(pathfinder);
    this.minebot.loadPlugin(pvp);

    this.minebot.on('spawn', () => {
      for(let i = 0; i < 1; i++){
        this.minebot.chat(this.name);
        // this.followPlayer('Squisheyyy')
      }
    })

    this.minebot.on('kicked', () => {
      let time = getRandomInt(1800, 3500);
      if(this.connections >= 1) {console.log(`${this.username} fully disconnected`); return;}
      console.log('Connection closed, retrying');
      setTimeout(() => {
        new bot(this.name, this.ip, this.port, {connections: this.connections + 1});
        delete this;
      }, time)
    });

    this.minebot.on('error', () => {
      let time = getRandomInt(1800, 3500);
      console.log(this.connections);
      if(this.connections >= 1) {console.log(`${this.username} fully disconnected`); return;}
      console.log('Connection closed, retrying');
      setTimeout(() => {
        new bot(this.name, this.ip, this.port, {connections: this.connections + 1});
        delete this;
      }, time)
    });

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

      if(!player){ return 0 };
      this.minebot.pvp.attack(player.entity);
      return 1;
  }

  followPlayer(name){
    const playerCI = this.minebot.players[name];

    if(!playerCI){
        return 0;
    }

    const mcData = require('minecraft-data')(this.minebot.version);
    const movements = new Movements(this.minebot, mcData);
    this.minebot.pathfinder.setMovements(movements);

    const goal = new GoalFollow(playerCI.entity, 1);
    this.minebot.pathfinder.setGoal(goal, true);
    return 1;
  }
}

module.exports = bot;