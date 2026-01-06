import { Test, TestingModule } from "@nestjs/testing";
import { MemberRankService } from "./member-rank.service";

describe("MemberRankService", () => {
    let service: MemberRankService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MemberRankService],
        }).compile();

        service = module.get<MemberRankService>(MemberRankService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
