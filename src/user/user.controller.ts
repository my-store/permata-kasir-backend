import { User, Prisma } from '../../generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from 'src/admin/admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParseUrlQuery } from 'src/libs/string';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import {
  GetFileDestBeforeUpload,
  ProfileImageValidator,
  upload_img_dir,
  DeleteFile,
  UploadFile,
} from 'src/libs/upload-file-handler';
import {
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Controller,
  UseGuards,
  Delete,
  Query,
  Patch,
  Param,
  Body,
  Post,
  Get,
} from '@nestjs/common';
import { encryptPassword } from 'src/libs/bcrypt';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}

  // Look at .env file
  // The URL should be '/api/admin/register/APP_REGISTER_DEVCODE'
  @Post('register/:dev_code')
  @UseInterceptors(FileInterceptor('foto'))
  async register(
    @Param('dev_code') dev_code: string,
    @Body() data: CreateUserDto,
    @UploadedFile()
    foto: Express.Multer.File,
  ): Promise<any> {
    // Wrong developer key not presented
    if (!dev_code || dev_code != process.env.APP_REGISTER_DEVCODE) {
      // Terminate task
      throw new UnauthorizedException();
    }
    return this.create(data, foto);
  }

  @UseGuards(AuthGuard)
  @Post('verify-password/:tlp')
  async checkPassword(
    @Param('tlp') tlp: string,
    @Body() { password }: UpdateUserPasswordDto,
  ): Promise<any> {
    /* ------------------ MENGAMBIL DATA LAMA ------------------ */
    let oldData: User | null;
    try {
      oldData = await this.userService.findOne({ where: { tlp } });
    } catch {
      throw new BadRequestException('User tidak ditemukan!');
    }

    const oldPassword: any = oldData?.password;
    const result = bcrypt.compareSync(password, oldPassword);
    return { result };
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() data: CreateUserDto,
    @UploadedFile()
    foto: Express.Multer.File,
  ): Promise<User> {
    let newData: any;

    /* ------------------ USER TIDAK MENGUNGGAH FOTO ------------------ */
    if (!foto) {
      throw new BadRequestException('Wajib mengunggah foto!');
    } else {
      /* --------------------- PENGECEKAN FORMAT DAN UKURAN FOTO ---------------------
      |  Format foto yang dibolehkan adalah: JPG, JPEG dan PNG
      |  Lihat selengkapnya di: libs/upload-file-handler.ts/ProfileImageValidator()
      */
      const { status, message } = ProfileImageValidator(foto);
      if (!status) {
        throw new BadRequestException(message);
      }
    }

    /* ------------------ PENGECEKAN NO. TLP ------------------
    |  Pastikan No. Tlp belum ada yang menggunakan, jika ada
    |  user ataupun admin yang menggunakan No. Tlp tersebut,
    |  permintaan input data ditolak.
    */
    let alreadyUsed: boolean = false;
    try {
      // Pengecekan apakah ada user yang menggunakan No. Tlp tersebut
      const usrExist: any = await this.userService.findOne({
        where: { tlp: data.tlp },
      });
      if (usrExist) {
        // No. Tlp telah digunakan oleh seorang user
        alreadyUsed = true;
      }
    } catch {}

    // Tidak ada user yang menggunakan No. Tlp tersebut
    if (!alreadyUsed) {
      // Pengecekan apakah ada admin yang menggunakan No. Tlp tersebut
      try {
        const admExist: any = await this.adminService.findOne({
          where: { tlp: data.tlp },
        });
        if (admExist) {
          // No. Tlp telah digunakan oleh seorang admin
          alreadyUsed = true;
        }
      } catch {}
    }

    // Jika ada user atau admin yang telah menggunakan No. Tlp tersebut
    if (alreadyUsed) {
      // Terminate task | Tolak permintaan input
      throw new BadRequestException(`No. Tlp ${data.tlp} telah digunakan!`);
    }

    /* ------------------ NAMA FOTO ------------------
    |  Nama foto berasal dari No. Tlp user
    */
    const img_path = `${upload_img_dir}/user/profile`;
    const img_name = data.tlp;
    data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);

    /* ------------------ MENYIMPAN DATA ------------------
    |  Simpan data dulu, foto hanya URL saja, upload file
    |  setelah berhasil menyimpan data.
    */
    try {
      newData = await this.userService.create({
        ...data,

        // Remove 'public' from image directory
        foto: data.foto.replace('public', ''),
      });
    } catch (e) {
      // Unique constraint error
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          throw new BadRequestException(
            'There is a unique constraint violation.',
          );
        }
      }

      // Another error
      throw new InternalServerErrorException(e);
    }

    /* ------------------ MENGUNGGAH FOTO ------------------
    |  Setelah data berhasil disimpan, proses selanjutnya
    |  adalah mengunggah foto.
    */
    try {
      UploadFile(foto, data.foto);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    /* ------------------ SELESAI ------------------
    |  Setelah data berhasil disimpan, dan foto
    |  berhasil di unggah, proses selanjutnya adalah
    |  mengembalikan data baru tersebut kepada client.
    */
    return newData;
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() query: any): Promise<User[]> {
    const args: any = ParseUrlQuery(query);
    let data: User[];

    try {
      data = await this.userService.findAll(args);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Get(':tlp')
  async findOne(@Param('tlp') tlp: string): Promise<User | null> {
    let data: User | null;

    try {
      data = await this.userService.findOne({ where: { tlp } });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Patch(':tlp')
  async update(
    @Param('tlp') tlp: string,
    @Body() data: UpdateUserDto,
    @UploadedFile() foto?: Express.Multer.File,
  ): Promise<User> {
    let updatedData: User;

    /* ------------------ MENGAMBIL DATA LAMA ------------------ */
    let oldData: User | null;
    try {
      oldData = await this.userService.findOne({ where: { tlp } });
    } catch {
      throw new BadRequestException('User tidak ditemukan!');
    }

    /* ------------------ USER MERUBAH NO. TLP ------------------
    |  Pastikan No. Tlp belum ada yang menggunakan, jika ada
    |  user ataupun admin yang menggunakan No. Tlp tersebut,
    |  permintaan input data ditolak.
    */
    if (data.tlp) {
      // Pastikan No. Tlp baru tidak sama dengan No. Tlp lama
      if (data.tlp != oldData?.tlp) {
        let alreadyUsed: boolean = false;
        try {
          // Pengecekan apakah ada user yang menggunakan No. Tlp tersebut
          const usrExist: any = await this.userService.findOne({
            where: { tlp: data.tlp },
          });
          if (usrExist) {
            // No. Tlp telah digunakan oleh seorang user
            alreadyUsed = true;
          }
        } catch {}

        // Tidak ada user yang menggunakan No. Tlp tersebut
        if (!alreadyUsed) {
          // Pengecekan apakah ada admin yang menggunakan No. Tlp tersebut
          try {
            const admExist: any = await this.adminService.findOne({
              where: { tlp: data.tlp },
            });
            if (admExist) {
              // No. Tlp telah digunakan oleh seorang admin
              alreadyUsed = true;
            }
          } catch {}
        }

        // Jika ada user atau admin yang telah menggunakan No. Tlp tersebut
        if (alreadyUsed) {
          // Terminate task | Tolak permintaan input
          throw new BadRequestException(`No. Tlp ${data.tlp} telah digunakan!`);
        }
      }
    }

    /* ------------------ USER MERUBAH PASSWORD ------------------ */
    if (data.password) {
      // Enkripsi password
      data.password = encryptPassword(data.password);
    }

    /* ------------------ USER MERUBAH FOTO ------------------ */
    if (foto) {
      /* --------------------- PENGECEKAN FORMAT DAN UKURAN FOTO ---------------------
      |  Format foto yang dibolehkan adalah: JPG, JPEG dan PNG
      |  Lihat selengkapnya di: libs/upload-file-handler.ts/ProfileImageValidator()
      */
      const { status, message } = ProfileImageValidator(foto);
      if (!status) {
        throw new BadRequestException(message);
      }

      /* ------------------ NAMA FOTO ------------------
      |  Nama foto berasal dari No. Tlp user
      */
      const img_path = `${upload_img_dir}/user/profile`;
      const img_name = tlp;
      data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);
    }

    /* ------------------ MENYIMPAN DATA ------------------ */
    try {
      updatedData = await this.userService.update(
        { tlp },
        {
          ...data,

          // Remove 'public' from image directory
          foto: data.foto?.replace('public', ''),
        },
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    /* ------------------ MENGUNGGAH FOTO (JIKA ADA) ------------------
    |  Setelah data berhasil disimpan, proses selanjutnya
    |  adalah mengunggah foto.
    */
    if (foto) {
      // Hapus foto lama dulu
      try {
        DeleteFile('public' + oldData?.foto);
      } catch (e) {
        throw new InternalServerErrorException(e);
      }

      // Mengunggah foto baru
      try {
        UploadFile(foto, 'public' + updatedData.foto);
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }

    /* --------------------- SELESAI ---------------------
    |  Setelah data berhasil disimpan, dan foto (jika ada)
    |  berhasil di unggah, proses selanjutnya adalah
    |  mengembalikan data baru tersebut kepada client.
    */
    return updatedData;
  }

  @UseGuards(AuthGuard)
  @Delete(':tlp')
  async remove(@Param('tlp') tlp: string): Promise<User> {
    let deletedData: User;

    // Delete data from database
    try {
      deletedData = await this.userService.remove({ tlp });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    // Delete image profile too
    try {
      // Dont forget to add 'public' int the path
      DeleteFile('public' + deletedData.foto);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    // Data yang berhasil di hapus dari database
    return deletedData;
  }
}
