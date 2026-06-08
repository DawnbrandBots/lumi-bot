import { Migration } from "@mikro-orm/migrations";

export class Migration20260608183847 extends Migration {
    override up(): void | Promise<void> {
        this.addSql(
            `create table \`lfg_room\` (\`id\` text not null primary key, \`guild_id\` text not null, \`code\` text not null, \`owner_id\` text not null, \`created_at\` date not null);`,
        );

        this.addSql(
            `create table \`lfg_room_player\` (\`id\` text not null primary key, \`user_id\` text not null, \`room_id\` text not null, \`joined_at\` date not null, constraint \`lfg_room_player_room_id_foreign\` foreign key (\`room_id\`) references \`lfg_room\` (\`id\`));`,
        );
        this.addSql(`create index \`lfg_room_player_room_id_index\` on \`lfg_room_player\` (\`room_id\`);`);
    }
}
