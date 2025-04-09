class Unit {
    constructor({ life, moral, base_attack, base_defense, power, initimidation, armor, speed, stance_name, superior }) {
        this.token = null;
        this.sync();
    }

    attack_other(target) {

        // distance entre this.token et target
        let token = canvas.tokens.controlled[0];
        let rival = Array.from(game.user.targets)[0]
        let ray = new Ray(token.center, rival.center);
        let distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
        
        conflict(token, rival, "attack", distance)

        if (distance <= 100) {
            //Pop up : "défense?"

            if (response == true)
                conflict(other, this.token, "defense", range)


        }
    }




    sync() {
        //this.life = life ?? 0;
        //this.moral = moral ?? 0;
        //this.base_attack = base_attack ?? 0;
        //this.base_defense = base_defense ?? 0;
        //this.power = power ?? 0;
        //this.initimidation = initimidation ?? 0;
        //this.armor = armor ?? 0;
        //this.speed = speed ?? 0;
        //this.set_stance(stance_name ?? "combat");
        //this.superior = superior ?? null;

    }
}

class Soldat extends Unit {
    constructor() {
        super({});
    }
}

let soldat = new Soldat()