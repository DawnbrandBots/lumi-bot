import { Migration } from "@mikro-orm/migrations";

export class Migration20260526141000 extends Migration {
    override up(): void {
        this.addSql(
            "create table `guild_config` (`id` text not null primary key, `guild` text not null, `lfg_channel` text null default null);",
        );
        this.addSql("create unique index `guild_config_guild_unique` on `guild_config` (`guild`);");
    }
}
