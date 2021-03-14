export class DiscordMessages{

public setURL(dbUrl:string);
public createUser(userId:string, guildId:string);
public deleteUser(userId:string, guildId:string);
public appendMessage(userId:string, guildId:string, messages:number);
public setMessages(userId:string, guildId:string, messages:number);
public fetch(userId:string, guildId:string, fetchPosition:boolean);
public subtractMessages(userId:string, guildId:string, messages:number);
public fetchLeaderboard(guildId:string, limit:number);
public computeLeaderboard(client:any, leaderboard:any, fetchUsers:boolean);
}