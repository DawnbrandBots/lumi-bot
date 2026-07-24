import { Migration } from '@mikro-orm/migrations';

export class Migration20260716171902 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`guild_config\` (\`id\` text not null primary key, \`guild\` text not null, \`lfg_channel\` text null, \`lfg_role_ping_cooldown_minutes\` integer null);`);
    this.addSql(`create unique index \`guild_config_guild_unique\` on \`guild_config\` (\`guild\`);`);

    this.addSql(`create table \`guild_config_lfg_role\` (\`id\` text not null primary key, \`guild_config_id\` text not null, \`role\` text not null, \`last_pinged_at\` date null, constraint \`guild_config_lfg_role_guild_config_id_foreign\` foreign key (\`guild_config_id\`) references \`guild_config\` (\`id\`));`);
    this.addSql(`create index \`guild_config_lfg_role_guild_config_id_index\` on \`guild_config_lfg_role\` (\`guild_config_id\`);`);

    this.addSql(`create table \`lfg_room\` (\`id\` text not null primary key, \`guild_id\` text not null, \`code\` text not null, \`owner_id\` text not null, \`created_at\` date not null);`);

    this.addSql(`create table \`lfg_room_player\` (\`id\` text not null primary key, \`user_id\` text not null, \`room_id\` text not null, \`joined_at\` date not null, constraint \`lfg_room_player_room_id_foreign\` foreign key (\`room_id\`) references \`lfg_room\` (\`id\`));`);
    this.addSql(`create index \`lfg_room_player_room_id_index\` on \`lfg_room_player\` (\`room_id\`);`);
  }

}
