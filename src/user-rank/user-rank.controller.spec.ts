import { UserRankController } from "./user-rank.controller";
import { UserRankService } from "./user-rank.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("UserRankController", () => {
    let controller: UserRankController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserRankController],
            providers: [UserRankService],
        }).compile();

        controller = module.get<UserRankController>(UserRankController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
