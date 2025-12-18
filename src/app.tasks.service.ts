import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AppTasksService {
    private readonly logger = new Logger(AppTasksService.name);

    @Cron(CronExpression.EVERY_WEEKEND, { name: "backup-database" })
    backupDatabase() {
        // Run backup script here ..
        this.logger.debug("Backing up database...");
    }
}
