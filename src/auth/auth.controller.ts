import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';

interface UserWithoutPassword {
  _id: ObjectId;
  email: string;
}

interface JwtUser {
  userId: string;
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user: User = await this.usersService.create(createUserDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: { user: UserWithoutPassword }) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: { user: JwtUser }) {
    // Obtener el usuario completo de la base de datos
    const user = await this.usersService.findById(req.user.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Retornar solo los campos necesarios sin la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }
}
