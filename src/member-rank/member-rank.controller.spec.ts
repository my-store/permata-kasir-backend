import { MemberRankController } from "./member-rank.controller";
import { MemberRankService } from "./member-rank.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("MemberRankController", () => {
    let controller: MemberRankController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MemberRankController],
            providers: [MemberRankService],
        }).compile();

        controller = module.get<MemberRankController>(MemberRankController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
