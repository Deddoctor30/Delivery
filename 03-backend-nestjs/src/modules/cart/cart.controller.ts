import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CartDto } from './dto/cart-response.dto';

// Все методы возвращают актуальную корзину (CartDto). POST-ы отдают 200, а не 201,
// чтобы рантайм совпадал со схемой ответа (openapi-typescript).
@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOkResponse({ type: CartDto })
  getCart(@CurrentUser('userId') userId: string) {
    return this.cart.getCart(userId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CartDto })
  addItem(@CurrentUser('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(userId, dto);
  }

  @Patch('items/:productId')
  @ApiOkResponse({ type: CartDto })
  updateItem(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  @ApiOkResponse({ type: CartDto })
  removeItem(@CurrentUser('userId') userId: string, @Param('productId') productId: string) {
    return this.cart.removeItem(userId, productId);
  }

  @Delete()
  @ApiOkResponse({ type: CartDto })
  clearCart(@CurrentUser('userId') userId: string) {
    return this.cart.clearCart(userId);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CartDto })
  merge(@CurrentUser('userId') userId: string, @Body() dto: MergeCartDto) {
    return this.cart.merge(userId, dto);
  }
}
