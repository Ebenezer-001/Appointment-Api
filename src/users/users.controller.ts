import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('super-admin/business-admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createBusinessAdmin(@Body() dto: CreateUserDto) {
    return this.usersService.createUser({
      ...dto,
      role: UserRole.BUSINESS_ADMIN,
    });
  }
}
