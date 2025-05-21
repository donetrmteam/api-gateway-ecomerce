import { ApiProperty } from '@nestjs/swagger';

class UserInfo {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticación'
  })
  access_token: string;

  @ApiProperty({
    description: 'Información básica del usuario'
  })
  user: UserInfo;
} 