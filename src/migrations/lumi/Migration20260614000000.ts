import { Migration } from "@mikro-orm/migrations";

export class Migration20260614000000 extends Migration {
    override up(): void | Promise<void> {
        this.addSql(`alter table \`lfg_room_player\` add column \`last_activity_at\` date null;`);
        this.addSql(`update \`lfg_room_player\` set \`last_activity_at\` = \`joined_at\`;`);
        this.addSql(`alter table \`lfg_room_player\` add column \`inactivity_warned_at\` date null;`);
    }
}
