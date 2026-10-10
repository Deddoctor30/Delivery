import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FavoriteIdsDto, FavoritesListDto } from './dto/favorite-response.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOkResponse({ type: FavoritesListDto })
  list(@CurrentUser('userId') userId: string) {
    return this.favorites.list(userId);
  }

  @Get('ids')
  @ApiOkResponse({ type: FavoriteIdsDto })
  ids(@CurrentUser('userId') userId: string) {
    return this.favorites.ids(userId);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FavoriteIdsDto })
  add(@CurrentUser('userId') userId: string, @Param('productId') productId: string) {
    return this.favorites.add(userId, productId);
  }

  @Delete(':productId')
  @ApiOkResponse({ type: FavoriteIdsDto })
  remove(@CurrentUser('userId') userId: string, @Param('productId') productId: string) {
    return this.favorites.remove(userId, productId);
  }
}
