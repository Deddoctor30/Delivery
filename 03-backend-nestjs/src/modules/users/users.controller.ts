import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserDto })
  getMe(@CurrentUser('userId') userId: string) {
    return this.users.getMe(userId);
  }

  @Patch('me')
  @ApiOkResponse({ type: UserDto })
  updateMe(@CurrentUser('userId') userId: string, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(userId, dto);
  }

  // TODO(этап 12): вернуть реальные заказы пользователя
  @Get('me/orders')
  getMyOrders() {
    return [];
  }
}
