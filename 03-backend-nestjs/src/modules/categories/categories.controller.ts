import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CategoriesService } from './categories.service';
import { CategoryDetailDto, CategoryTreeDto } from './dto/category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: CategoryTreeDto, isArray: true })
  getTree() {
    return this.categories.findTree();
  }

  @Public()
  @Get(':slug')
  @ApiOkResponse({ type: CategoryDetailDto })
  getBySlug(@Param('slug') slug: string) {
    return this.categories.findBySlug(slug);
  }
}
