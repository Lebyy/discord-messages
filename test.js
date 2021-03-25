const Messages = require("./index.js");
async function lol(){
let e = await Messages.setURL("mongodb+srv://arc:arcisthebest@arc.lx8o9.mongodb.net/testdb?retryWrites=true&w=majority");
//console.log(e)
const hasLeveledUp = await Messages.appendMessage("541282732609765377", "630058179547627592", "1");
const hasLeveledUp1 = await Messages.appendMessage("725619404330631229", "630058179547627592", "1");
//console.log(hasLeveledUp)
const user = await Messages.fetch("541282732609765377", "630058179547627592", true); 
console.log(user)

const rawLeaderboard = await Messages.fetchLeaderboard("630058179547627592", 10);
//console.log(rawLeaderboard)
}
lol()