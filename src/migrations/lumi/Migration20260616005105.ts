import { Migration } from '@mikro-orm/migrations';

export class Migration20260616005105 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`guild_config\` (\`id\` text not null primary key, \`guild\` text not null, \`lfg_channel\` text null, \`lfg_role\` text null, \`lfg_role_last_pinged_at\` date null);`);
    this.addSql(`create unique index \`guild_config_guild_unique\` on \`guild_config\` (\`guild\`);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`guild_config\`;`);
  }

}
