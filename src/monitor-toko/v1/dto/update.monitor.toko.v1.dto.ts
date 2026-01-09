import { CreateMonitorTokoDtoV1 } from "./create.monitor.toko.v1.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateMonitorTokoDtoV1 extends PartialType(
    CreateMonitorTokoDtoV1,
) {}
