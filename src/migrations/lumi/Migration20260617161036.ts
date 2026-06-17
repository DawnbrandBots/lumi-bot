import { Migration } from '@mikro-orm/migrations';

export class Migration20260617161036 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`guild_config_lfg_role\` (\`id\` text not null primary key, \`guild_config_id\` text not null, \`role\` text not null, \`last_pinged_at\` date null, constraint \`guild_config_lfg_role_guild_config_id_foreign\` foreign key (\`guild_config_id\`) references \`guild_config\` (\`id\`));`);
    this.addSql(`create index \`guild_config_lfg_role_guild_config_id_index\` on \`guild_config_lfg_role\` (\`guild_config_id\`);`);

    this.addSql(`alter table \`guild_config\` drop column \`lfg_role\`;`);
    this.addSql(`alter table \`guild_config\` drop column \`lfg_role_last_pinged_at\`;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`guild_config_lfg_role\`;`);

    this.addSql(`alter table \`guild_config\` add column \`lfg_role\` text null;`);
    this.addSql(`alter table \`guild_config\` add column \`lfg_role_last_pinged_at\` date null;`);
  }

}
