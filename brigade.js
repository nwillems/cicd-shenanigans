const { events } = require("brigadier");

events.on("push", function(e, project) {
  console.log("Received push:")
  console.log(e)
})
