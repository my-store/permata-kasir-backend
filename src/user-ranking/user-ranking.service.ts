import { Injectable } from '@nestjs/common';
import { CreateUserRankingDto } from './dto/create-user-ranking.dto';
import { UpdateUserRankingDto } from './dto/update-user-ranking.dto';

@Injectable()
export class UserRankingService {
  create(createUserRankingDto: CreateUserRankingDto) {
    return 'This action adds a new userRanking';
  }

  findAll() {
    return `This action returns all userRanking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userRanking`;
  }

  update(id: number, updateUserRankingDto: UpdateUserRankingDto) {
    return `This action updates a #${id} userRanking`;
  }

  remove(id: number) {
    return `This action removes a #${id} userRanking`;
  }
}
