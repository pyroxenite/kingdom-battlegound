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