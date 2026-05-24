import { Migration } from '@mikro-orm/migrations';

export class Migration20260524104057 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`room\` (\`id\` text not null primary key, \`guild_id\` text not null, \`code\` text not null, \`owner_id\` text not null, \`created_at\` date not null);`);

    this.addSql(`create table \`room_player\` (\`id\` text not null primary key, \`user_id\` text not null, \`room_id\` text not null, \`joined_at\` date not null, constraint \`room_player_room_id_foreign\` foreign key (\`room_id\`) references \`room\` (\`id\`));`);
    this.addSql(`create index \`room_player_room_id_index\` on \`room_player\` (\`room_id\`);`);
  }

}
