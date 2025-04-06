console.log("Kingdom Battleground Loaded")
ui.notifications.info("Kingdom Battleground Loaded");

function add_listen_socket() {
    game.socket.on('kingdom.com', (arg1, arg2, arg3) => {
        console.log(arg1, arg2, arg3); // expected: "foo bar bat"
    })
}

function talk() {
    const targetUser = game.users.find(u => u.name === "Assistant MJ");

    if (!targetUser) {
        ui.notifications.warn("Utilisateur non trouvé !");
        return;
    }

    game.socket.emit("kingdom.com", {
        userId: targetUser.name,
        title: "Un message secret",
        content: "<p>Voici une surprise pour toi !</p>"
    });
}

function conflict(token, rival, conflict_type) {

    // vérifie si une seule target et un seul token a été sélectionné
    if (conflict_type != "attaque" && conflict_type != "defense") {
        throw new Error(`conflict_type: "${conflict_type}" must be "attaque" or "defense"!`)
    }
    let actor = token?.actor;
    if (!actor) {
        ui.notifications.warn("Sélectionne un token !");
        return
    }
    if (canvas.tokens.controlled.length >= 2) {
        ui.notifications.warn("Sélectionne <b>un seul</b> token !");
        return
    }
    if (!rival) {
        ui.notifications.warn("Sélectionne une cible avec la touche [<b>T</b>] !");
        return
    }
    if (game.user.targets.size >= 2) {
        ui.notifications.warn("Selectionne <b>Une seule</b> cible valide !");
        return
    }

    ui.notifications.warn(`${actor.name} ${conflict_type} ${rival.actor.name}`);

    // Définit des variables sympas
    let player_color = game.users.current.color.css; // !!! Trouver la coleur du joueur à qui appartient la target !!!
    let base_conflict_cac = actor.system.attributeBar["base_" + conflict_type].value;
    let actor_name = actor.name;
    let rival_name = rival.actor.name;

    // Calcule le modificateur de hauteur
    let height_diff = get_height(token) - get_height(rival);
    let height_factor = 1
    let height_mod = height_diff * height_factor
    let height_name = "Égale"
    if (height_diff > 0)
        height_name = "Au dessus"
    if (height_diff < 0)
        height_name = "En dessous"

    // Récupère les propriétés des postures
    let stance_name = actor.system.props.posture;
    let rival_stance_name = rival.actor.system.props.posture;
    if (stance_name == "special") {
        stance_name = special_stance(actor_name)
    }
    if (rival_stance_name == "special") {
        rival_stance_name = special_stance(rival_name)
    }
    let stance_prop = get_stance_properties(stance_name);
    let rival_stance_prop = get_stance_properties(rival_stance_name);
    let esquive_or_precision = (conflict_type == "attaque") ? "esquive" : "precision";

    // Récurpère les propriétés des régions
    let region_prop = get_region_modifier(token)
    let rival_region_prop = get_region_modifier(rival)


    // Calcule l'attaque du token
    let conflict_cac = base_conflict_cac
        + stance_prop[conflict_type + "_cac"]
        + region_prop[conflict_type + "_cac"]
        - rival_stance_prop[esquive_or_precision + "_cac"]
        - rival_region_prop[esquive_or_precision + "_cac"]
        + height_mod

    // Lance un Dé
    new Roll("1d20").evaluate().then((result) => {
        let success = (conflict_cac >= result._total);
        let critique = critique_type(result._total)

        // Affiche le tableau
        display_attack_in_chat(conflict_type, actor_name, base_conflict_cac, conflict_cac, stance_prop, region_prop, result._total, success, critique, rival_stance_prop.name, rival_stance_prop, rival_name, rival_region_prop, player_color, height_mod, height_name);
    })
}

function display_attack_in_chat(conflict_type, actor_name, base_conflict_cac, attaque_cac, stance_prop, region_mod, roll_result, success, critique, rival_stance_prop_name, rival_stance_prop, rival_name, rival_region_prop, player_color, height_mod, height_name) {

    ChatMessage.create({
        content: `
      <b>${actor_name} ${conflict_type == "attaque" ? "attaque" : "réplique contre"} ${rival_name}</b>
      <br>
      <table border="1">
        <thead style="background-color: ${player_color}">
          <tr>
            <th>Attribut</th>
            <th>Valeur</th>
  
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${conflict_type == "attaque" ? "Attaque" : "Défense"}</td>
            <td>${base_conflict_cac}</td>
  
          </tr>
          <tr>
            <td>Modificateurs</td>
            <td>${s_num(stance_prop.attaque_cac)} (${stance_prop.name}) ${s_num(region_mod.attaque ?? 0)} (${region_mod.name ?? "Plaines"})</td>
          </tr>
          <tr>
            <td>Hauteur</td>
  
            <td>${s_num(height_mod)} (${height_name})</td>
          </tr>
          <tl>
          <tr>
            <td>Esquive Adverse</td>
            <td>${s_num(-rival_stance_prop.esquive_cac)} (${rival_stance_prop_name})  ${s_num(-rival_region_prop.esquive_cac)} (${rival_region_prop.name})</td>
          </tr>
          <tl>
        </tbody>
        <tfoot style="color: white">
          <tr>
            <td>Total ${conflict_type == "attaque" ? "Attaque" : "Défense"}</td>
            <td>${attaque_cac}</td>
          </tr>
          <tr>
            <td>Résultat du Dé</td>
            <td>${roll_result} ${critique}</td>
          </tr>
          <tr>
            <td>Résultat</td>
            <td>${success ? "Attaque réussie" : "Attaque échoué"}</td>
          </tr>
      </table>
      `
    });
}

function get_height(token) {
    let regions = canvas.regions.children[0].children;
    for (let region of regions) {
        if (!token.testInsideRegion(region, token.position)) {
            continue;
        }
        if (region.document.name.slice(0, 7) == "Hauteur") {
            return Number(region.document.name.slice(7,))
        }
    }
    return 0
}

function get_region_modifier(token) {
    let regions = canvas.regions.children[0].children;
    for (let region of regions) {
        if (!token.testInsideRegion(region, token.position)) {
            continue;
        }

        if (region.document.name == "Forets") {
            return {
                name: region.document.name,
                vitesse: -1,
                attaque_cac: -1, attaque_tir: -2,
                defense_cac: +2, defense_tir: +2,
                puissance_cac: -1, puissance_tir: -2,
                intimidation_cac: +1, intimidation_tir: +1,
                esquive_cac: +2, esquive_tir: +2,
                precision_cac: -1, precision_tir: -2,
                armure: +1, armure_tour: 0,
                moral_tour: 0, vitalite_tour: 0
            };
        }
        if (region.document.name == "Fleuves") {
            return {
                name: region.document.name,
                vitesse: -1,
                attaque_cac: -3, attaque_tir: -3,
                defense_cac: -3, defense_tir: -3,
                puissance_cac: -3, puissance_tir: -2,
                intimidation_cac: -2, intimidation_tir: +2,
                esquive_cac: -2, esquive_tir: -2,
                precision_cac: -2, precision_tir: -2,
                armure: -1, armure_tour: 0,
                moral_tour: 0, vitalite_tour: 0
            };
        }
        if (region.document.name == "Routes") {
            return {
                name: region.document.name,
                vitesse: +1,
                attaque_cac: +2, attaque_tir: +1,
                defense_cac: 0, defense_tir: -1,
                puissance_cac: +1, puissance_tir: +1,
                intimidation_cac: +1, intimidation_tir: +1,
                esquive_cac: -1, esquive_tir: -2,
                precision_cac: +2, precision_tir: +1,
                armure: 0, armure_tour: 0,
                moral_tour: 0, vitalite_tour: 0
            }
        }
        if (region.document.name == "Batiments") {
            return {
                name: region.document.name,
                vitesse: -1,
                attaque_cac: -1, attaque_tir: -3,
                defense_cac: +4, defense_tir: +2,
                puissance_cac: 0, puissance_tir: -1,
                intimidation_cac: 0, intimidation_tir: 0,
                esquive_cac: +2, esquive_tir: +4,
                precision_cac: +1, precision_tir: +1,
                armure: +2, armure_tour: 0,
                moral_tour: 0, vitalite_tour: 0
            };
        }
        if (region.document.name == "Ponts") {
            return {
                name: region.document.name,
                vitesse: -1,
                attaque_cac: 0, attaque_tir: +1,
                defense_cac: +2, defense_tir: +1,
                puissance_cac: -1, puissance_tir: 0,
                intimidation_cac: +1, intimidation_tir: 0,
                esquive_cac: +1, esquive_tir: -2,
                precision_cac: +1, precision_tir: +1,
                armure: 0, armure_tour: 0,
                moral_tour: 0, vitalite_tour: 0
            };
        }
    }
    return {
        name: "Plaine",
        vitesse: 0,
        attaque_cac: 0, attaque_tir: 0,
        defense_cac: 0, defense_tir: 0,
        puissance_cac: 0, puissance_tir: 0,
        intimidation_cac: 0, intimidation_tir: 0,
        esquive_cac: 0, esquive_tir: 0,
        precision_cac: 0, precision_tir: 0,
        armure: 0, armure_tour: 0,
        moral_tour: 0, vitalite_tour: 0
    };
}

function get_stance_properties(stance_name) {
    const stances = {
        marche: {
            name: "Marche", vitesse: +1,
            attaque_cac: -1, attaque_tir: -2,
            defense_cac: -2, defense_tir: -1,
            puissance_cac: +1, puissance_tir: -1,
            intimidation_cac: 0, intimidation_tir: 0,
            esquive_cac: +1, esquive_tir: +2,
            precision_cac: 0, precision_tir: -2,
            armure: -1, armure_tour: 0,
            moral_tour: 0, vitalite_tour: 0
        },
        combat: {
            name: "Combat", vitesse: -1,
            attaque_cac: +1, attaque_tir: +1,
            defense_cac: +1, defense_tir: +1,
            puissance_cac: +2, puissance_tir: +2,
            intimidation_cac: +1, intimidation_tir: +1,
            esquive_cac: 0, esquive_tir: 0,
            precision_cac: +1, precision_tir: +2,
            armure: +1, armure_tour: 0,
            moral_tour: 0, vitalite_tour: 0,
        },
        charge: {
            name: "Charge", vitesse: +2,
            attaque_cac: +3, attaque_tir: -2,
            defense_cac: -1, defense_tir: -2,
            puissance_cac: +3, puissance_tir: -2,
            intimidation_cac: +2, intimidation_tir: -1,
            esquive_cac: +2, esquive_tir: +3,
            precision_cac: +3, precision_tir: -2,
            armure: 0, armure_tour: 0,
            moral_tour: -1, vitalite_tour: 0,
        },
        percee: {
            name: "Percée", vitesse: +1,
            attaque_cac: +2, attaque_tir: -2,
            defense_cac: -1, defense_tir: -2,
            puissance_cac: +2, puissance_tir: -2,
            intimidation_cac: 0, intimidation_tir: 0,
            esquive_cac: 0, esquive_tir: +2,
            precision_cac: +2, precision_tir: -2,
            armure: 0, armure_tour: 0,
            moral_tour: 0, vitalite_tour: 0,
        },
        def_charge: {
            name: "Défense de combat", vitesse: -1,
            attaque_cac: -2, attaque_tir: -1,
            defense_cac: +4, defense_tir: -2,
            puissance_cac: -1, puissance_tir: -2,
            intimidation_cac: -2, intimidation_tir: +1,
            esquive_cac: +1, esquive_tir: -1,
            precision_cac: 0, precision_tir: -2,
            armure: +2, armure_tour: 0,
            moral_tour: 0, vitalite_tour: 0
        },
        def_eparse: {
            name: "Défense à distance", vitesse: 0,
            attaque_cac: -3, attaque_tir: 0,
            defense_cac: -3, defense_tir: 0,
            puissance_cac: -2, puissance_tir: -1,
            intimidation_cac: -2, intimidation_tir: -1,
            esquive_cac: +2, esquive_tir: +4,
            precision_cac: -2, precision_tir: -1,
            armure: +1, armure_tour: 0,
            moral_tour: 0, vitalite_tour: 0
        },
        repos: {
            name: "Repos", vitesse: -2,
            attaque_cac: -4, attaque_tir: -4,
            defense_cac: -3, defense_tir: -3,
            puissance_cac: -3, puissance_tir: -2,
            intimidation_cac: -2, intimidation_tir: -2,
            esquive_cac: 0, esquive_tir: 0,
            precision_cac: 0, precision_tir: -2,
            armure: -2, armure_tour: +1,
            moral_tour: +1, vitalite_tour: 0,
        },
        tortue: {
            name: "Tortue", vitesse: -2,
            attaque_cac: -2, attaque_tir: null,
            defense_cac: +3, defense_tir: +3,
            puissance_cac: 0, puissance_tir: 0,
            intimidation_cac: +2, intimidation_tir: null,
            esquive_cac: +2, esquive_tir: +2,
            precision_cac: -2, precision_tir: null,
            armure: +2, armure_tour: 0,
            moral_tour: 0, vitalite_tour: 0,
        },
    }

    let result = stances[stance_name];

    if (result == null) {
        throw new Error(`Could not find stance "${stance_name}".`);
    }

    return result;
}

function special_stance(actor) {
    if (actor == "Phalange") {
        return "tortue"
    }
    else {
        if (actor == artor_name) {
            ui.notifications.warn(`Attention : Votre ${actor.toLowerCase()} ne possède pas de posture spéciale !
        <br> La posture de combat est priviligié. C'est la sauce du chef`);
        }
        if (actor == rival_name) {
            ui.notifications.warn(`Attention : ${actor.toLowerCase()}  adverse ne possède pas de posture spéciale !
        <br> La posture de combat est priviligié. C'est la sauce du chef`);
        }
        return "combat"
    }
}

function critique_type(result) {
    if (result == 1) {
        return "Reussite Critique"
    }
    if (result == 20) {
        return "Echec Critique"
    }
    else {
        return " "
    }
}

function s_num(x) {
    if (x == 0) {
        return "0"
    }
    if (x > 0) {
        return `+${x}`
    }
    if (x < 0) {
        return `${x}`
    }
}