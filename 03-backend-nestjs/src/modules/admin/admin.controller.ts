import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/types';
import { OrderListQueryDto } from '../orders/dto/order-list-query.dto';
import { AdminService } from './admin.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

@Controller('admin')
@Roles('ADMIN') // весь контроллер — только для админа
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.admin.listUsers(query.search, query.page, query.limit);
  }

  @Get('users/:id/orders')
  userOrders(@Param('id') id: string, @Query() query: OrderListQueryDto) {
    return this.admin.userOrders(id, query.page, query.limit);
  }

  @Post('orders/:id/cancel')
  cancelOrder(@CurrentUser() admin: AuthUser, @Param('id') id: string) {
    return this.admin.cancelOrder(id, admin);
  }
}
