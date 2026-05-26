import { Migration } from "@mikro-orm/migrations";

export class Migration20260526141000 extends Migration {
    override up(): void {
        this.addSql(
            "create table `config` (`id` text not null primary key, `guild` text not null, `channel` text null default null);",
        );
        this.addSql("create unique index `config_guild_unique` on `config` (`guild`);");
    }
}
