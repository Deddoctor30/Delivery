import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderDto, OrderListDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderDto })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orders.create(userId, dto);
  }

  @Get()
  @ApiOkResponse({ type: OrderListDto })
  findMany(@CurrentUser('userId') userId: string, @Query() query: OrderListQueryDto) {
    return this.orders.findMany(userId, query.page, query.limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderDto })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.findOne(id, user);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderDto })
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.cancel(id, user);
  }
}
