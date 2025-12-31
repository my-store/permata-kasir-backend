import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateUserRankingDto } from './dto/create-user-ranking.dto';
import { UpdateUserRankingDto } from './dto/update-user-ranking.dto';
import { UserRankingService } from './user-ranking.service';

@Controller('user-ranking')
export class UserRankingController {
  constructor(private readonly userRankingService: UserRankingService) {}

  @Post()
  create(@Body() createUserRankingDto: CreateUserRankingDto) {
    return this.userRankingService.create(createUserRankingDto);
  }

  @Get()
  findAll() {
    return this.userRankingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRankingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserRankingDto: UpdateUserRankingDto) {
    return this.userRankingService.update(+id, updateUserRankingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRankingService.remove(+id);
  }
}
