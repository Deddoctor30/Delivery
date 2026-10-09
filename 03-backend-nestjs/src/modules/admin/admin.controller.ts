import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/types';
import { OrderListQueryDto } from '../orders/dto/order-list-query.dto';
import { OrderDto, OrderListDto } from '../orders/dto/order.dto';
import { UserDto } from '../users/dto/user.dto';
import { AdminService } from './admin.service';
import { AdminUserListDto } from './dto/admin-user-list.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@Roles('ADMIN') // весь контроллер — только для админа
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  @ApiOkResponse({ type: AdminUserListDto })
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.admin.listUsers(query.search, query.page, query.limit);
  }

  @Get('users/:id')
  @ApiOkResponse({ type: UserDto })
  getUser(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Get('users/:id/orders')
  @ApiOkResponse({ type: OrderListDto })
  userOrders(@Param('id') id: string, @Query() query: OrderListQueryDto) {
    return this.admin.userOrders(id, query.page, query.limit);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderDto })
  cancelOrder(@CurrentUser() admin: AuthUser, @Param('id') id: string) {
    return this.admin.cancelOrder(id, admin);
  }
}
