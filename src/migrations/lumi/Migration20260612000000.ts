import { Migration } from "@mikro-orm/migrations";

export class Migration20260612000000 extends Migration {
    override up(): void | Promise<void> {
        this.addSql(
            `create table \`lfg_queue_player\` (\`id\` text not null primary key, \`user_id\` text not null, \`guild_id\` text not null, \`joined_at\` date not null);`,
        );
        this.addSql(
            `create index \`lfg_queue_player_guild_id_joined_at_index\` on \`lfg_queue_player\` (\`guild_id\`, \`joined_at\`);`,
        );
    }
}
