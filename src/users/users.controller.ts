import { Controller, Get, Post, Body, Param, Delete, Patch, Request, UseGuards, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userServiceClient.send(
      { cmd: 'create_user' }, 
      { createUserDto }
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.userServiceClient.send(
      { cmd: 'find_all_users' }, 
      {}
    );
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    return this.userServiceClient.send(
      { cmd: 'get_user_profile' }, 
      { userId: req.user.userId }
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userServiceClient.send(
      { cmd: 'update_user' }, 
      { id, updateUserDto }
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    return this.userServiceClient.send(
      { cmd: 'remove_user' }, 
      { id }
    );
  }

  @Post('reset-password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Se ha enviado un token de recuperación al correo electrónico proporcionado',
    schema: {
      type: 'string',
      example: 'a1b2c3d4-e5f6-7890-abcd-123456789012'
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.userServiceClient.send(
      { cmd: 'request_password_reset' }, 
      { email: requestPasswordResetDto.email }
    );
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar recuperación de contraseña con token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Contraseña actualizada correctamente',
    schema: {
      type: 'boolean',
      example: true
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Token inválido' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Token expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userServiceClient.send(
      { cmd: 'reset_password' }, 
      { resetPasswordDto }
    );
  }
}