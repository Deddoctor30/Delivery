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
import { AddressesService } from './addresses.service';
import { AddressDto, CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

// Мутации возвращают актуальный список адресов (клиент синхронит стор целиком).
// POST/PATCH помечены @HttpCode(200), чтобы рантайм совпадал со схемой ответа.
@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  @ApiOkResponse({ type: AddressDto, isArray: true })
  list(@CurrentUser('userId') userId: string) {
    return this.addresses.list(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AddressDto, isArray: true })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateAddressDto) {
    return this.addresses.create(userId, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: AddressDto, isArray: true })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addresses.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: AddressDto, isArray: true })
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.addresses.remove(userId, id);
  }

  @Post(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AddressDto, isArray: true })
  setDefault(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.addresses.setDefault(userId, id);
  }
}
