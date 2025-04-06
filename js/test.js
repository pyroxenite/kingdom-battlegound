kingdom = {}
kingdom.callbacks = {}




function display_choice(prompt, options) {
    let choice_message_id = crypto.randomUUID();

    kingdom.callbacks[choice_message_id] = {}
    for (let option_id in options) {
        let option = options[option_id];
        kingdom.callbacks[choice_message_id][option_id] = option.callback;
    }

    let options_html = ""
    for (let option_id in options) {
        let option = options[option_id];
        options_html += `<div class="choice" style="--color: ${option.color};" onclick="kingdom.callbacks['${choice_message_id}']['${option_id}']()">${option.name}</div>`
    }

    ChatMessage.create({
        content: `
      <b>${prompt}</b>
      <br>
      <div class="choices">
        ${options_html}
      </div>
        `
    });
}