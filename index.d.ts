export class DiscordMessages{

public setURL(dbUrl:string): object;
public createUser(userId:string, guildId:string): object;
public deleteUser(userId:string, guildId:string): object;
public appendMessage(userId:string, guildId:string, messages:number): object;
public setMessages(userId:string, guildId:string, messages:number): object;
public fetch(userId:string, guildId:string, fetchPosition:boolean): object;
public subtractMessages(userId:string, guildId:string, messages:number): object;
public resetGuild(guildId:string): object;
public fetchLeaderboard(guildId:string, limit:number): object;
public computeLeaderboard(client:any, leaderboard:any, fetchUsers:boolean): object;
}
