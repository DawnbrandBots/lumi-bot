import { Migration } from '@mikro-orm/migrations';

export class Migration20260617153331 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table \`guild_config\` add column \`lfg_role\` text null;`);
    this.addSql(`alter table \`guild_config\` add column \`lfg_role_last_pinged_at\` date null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table \`guild_config\` drop column \`lfg_role\`;`);
    this.addSql(`alter table \`guild_config\` drop column \`lfg_role_last_pinged_at\`;`);
  }

}
