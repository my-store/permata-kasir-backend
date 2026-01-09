import { KasirControllerV1 } from "./v1/kasir.controller.v1";
import { KasirServiceV1 } from "./v1/kasir.service.v1";
import { Module } from "@nestjs/common";

@Module({
    exports: [KasirServiceV1],
    controllers: [KasirControllerV1],
    providers: [KasirServiceV1],
})
export class KasirModule {}
