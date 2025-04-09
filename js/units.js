class Unit {
    constructor({ life, moral, base_attack, base_defense, power, initimidation, armor, speed, stance_name, superior }) {
        this.token = null;
        this.sync();
    }

    attack_other(target) {
        let distance = 100 // distance entre this.token et target
        if (distance <= 100) {
            conflict_cac(this.token, other, "attack");
            // pop-up defense ?
        
        } else {
            conflict_tir(this.token, other);
        }
        
    }

    defend_from(other) {
        let distance = 100 // distance entre this.token et target
        if (distance <= 100) {
            //pop up
            conflict_cac(this.token, other, "defense");
        
        } else {
            //defense_tir(this.token, other);
        }
    }

    move(position) {

    }

    set_stance(stance_name) {

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