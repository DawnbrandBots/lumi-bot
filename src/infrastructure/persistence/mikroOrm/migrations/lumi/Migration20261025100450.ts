import { Migration } from "@mikro-orm/migrations";

export class Migration20261025100450 extends Migration {
    override name = "Migration20261025100450";

    override up(): void | Promise<void> {
        this.addSql(
            `create table \`bazaar_listing\` (\`id\` text not null primary key, \`guild_id\` text not null, \`owner_id\` text not null, \`side\` text check (\`side\` in ('PURCHASE', 'SALE')) not null, \`item_key\` text not null, \`item\` json not null, \`quantity\` integer null, \`unit_price\` integer null, \`created_at\` date not null, \`updated_at\` date not null);`,
        );
        this.addSql(
            `create unique index \`bazaar_listing_guild_id_owner_id_side_item_key_unique\` on \`bazaar_listing\` (\`guild_id\`, \`owner_id\`, \`side\`, \`item_key\`);`,
        );
    }

    override down(): void | Promise<void> {
        this.addSql(`drop table if exists \`bazaar_listing\`;`);
    }
}
