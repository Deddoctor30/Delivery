import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddCartItemDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  getCart(@CurrentUser('userId') userId: string) {
    return this.cart.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(userId, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cart.removeItem(userId, productId);
  }

  @Delete()
  clearCart(@CurrentUser('userId') userId: string) {
    return this.cart.clearCart(userId);
  }

  @Post('merge')
  merge(@CurrentUser('userId') userId: string, @Body() dto: MergeCartDto) {
    return this.cart.merge(userId, dto);
  }
}
