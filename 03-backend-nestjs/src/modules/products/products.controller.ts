import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductDto } from './dto/product.dto';
import { ProductListDto } from './dto/product-list.dto';
import { SuggestItemDto } from './dto/suggest-item.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: ProductListDto })
  list(@Query() query: ProductQueryDto) {
    return this.products.findMany(query);
  }

  // ВАЖНО: статические роуты — ДО параметрического ':id'
  @Public()
  @Get('popular')
  @ApiOkResponse({ type: ProductDto, isArray: true })
  popular() {
    return this.products.popular();
  }

  @Public()
  @Get('search/suggest')
  @UseGuards(ThrottlerGuard) // 30 req/min на IP
  @ApiOkResponse({ type: SuggestItemDto, isArray: true })
  suggest(@Query('q') q: string) {
    return this.products.suggest(q);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: ProductDto })
  findOne(@Param('id') id: string) {
    return this.products.findOne(id);
  }
}
