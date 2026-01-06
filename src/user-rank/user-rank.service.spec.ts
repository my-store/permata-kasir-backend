import { Test, TestingModule } from "@nestjs/testing";
import { UserRankService } from "./user-rank.service";

describe("UserRankService", () => {
    let service: UserRankService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserRankService],
        }).compile();

        service = module.get<UserRankService>(UserRankService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
