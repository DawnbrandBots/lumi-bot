import { Migration } from "@mikro-orm/migrations";

export class Migration20260612000000 extends Migration {
    override up(): void | Promise<void> {
        this.addSql(
            `create table \`bazaar_sale_entry\` (\`id\` text not null primary key, \`seller_id\` text not null, \`weapon_id\` text not null, \`variant\` text not null, \`quantity\` integer not null, \`price\` integer null default null, \`created_at\` date not null, \`updated_at\` date not null);`,
        );
        this.addSql(
            `create unique index \`bazaar_sale_entry_seller_id_weapon_id_variant_unique\` on \`bazaar_sale_entry\` (\`seller_id\`, \`weapon_id\`, \`variant\`);`,
        );
    }
}
