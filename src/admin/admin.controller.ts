import { Admin, Prisma } from '../../generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAdminDto, UpdateAdminPasswordDto } from './dto/update-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParseUrlQuery } from 'src/libs/string';
import { AdminService } from './admin.service';
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
  Patch,
  Param,
  Query,
  Body,
  Post,
  Get,
} from '@nestjs/common';
import { encryptPassword } from 'src/libs/bcrypt';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  // Look at .env file
  // The URL should be '/api/admin/register/APP_REGISTER_DEVCODE'
  @Post('register/:dev_code')
  @UseInterceptors(FileInterceptor('foto'))
  async register(
    @Param('dev_code') dev_code: string,
    @Body() data: CreateAdminDto,
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
    @Body() { password }: UpdateAdminPasswordDto,
  ): Promise<any> {
    /* ------------------ MENGAMBIL DATA LAMA ------------------ */
    let oldData: Admin | null;
    try {
      oldData = await this.adminService.findOne({ where: { tlp } });
    } catch {
      throw new BadRequestException('Admin tidak ditemukan!');
    }

    const oldPassword: any = oldData?.password;
    const result = bcrypt.compareSync(password, oldPassword);
    return { result };
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() data: CreateAdminDto,
    @UploadedFile()
    foto: Express.Multer.File,
  ): Promise<Admin> {
    let newData: any;

    /* ------------------ ADMIN TIDAK MENGUNGGAH FOTO ------------------ */
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
    |  admin ataupun user yang menggunakan No. Tlp tersebut,
    |  permintaan input data ditolak.
    */
    let alreadyUsed: boolean = false;
    try {
      // Pengecekan apakah ada admin yang menggunakan No. Tlp tersebut
      const admExist: any = await this.adminService.findOne({
        where: { tlp: data.tlp },
      });
      if (admExist) {
        // No. Tlp telah digunakan oleh seorang admin
        alreadyUsed = true;
      }
    } catch {}

    // Tidak ada admin yang menggunakan No. Tlp tersebut
    if (!alreadyUsed) {
      // Pengecekan apakah ada user yang menggunakan No. Tlp tersebut
      try {
        const usrExist: any = await this.userService.findOne({
          where: { tlp: data.tlp },
        });
        if (usrExist) {
          // No. Tlp telah digunakan oleh seorang user
          alreadyUsed = true;
        }
      } catch {}
    }

    // Jika ada admin atau user yang telah menggunakan No. Tlp tersebut
    if (alreadyUsed) {
      // Terminate task | Tolak permintaan input
      throw new BadRequestException(`No. Tlp ${data.tlp} telah digunakan!`);
    }

    /* ------------------ NAMA FOTO ------------------
    |  Nama foto berasal dari No. Tlp admin
    */
    const img_path = `${upload_img_dir}/admin/profile`;
    const img_name = data.tlp;
    data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);

    /* ------------------ MENYIMPAN DATA ------------------
    |  Simpan data dulu, foto hanya URL saja, upload file
    |  setelah berhasil menyimpan data.
    */
    try {
      newData = await this.adminService.create({
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
  async findAll(@Query() query: any): Promise<Admin[]> {
    const args: any = ParseUrlQuery(query);
    let data: Admin[];

    try {
      data = await this.adminService.findAll(args);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Get(':tlp')
  async findOne(@Param('tlp') tlp: string): Promise<Admin | null> {
    let data: Admin | null;

    try {
      data = await this.adminService.findOne({ where: { tlp } });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Patch(':tlp')
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('tlp') tlp: string,
    @Body() data: UpdateAdminDto,
    @UploadedFile() foto?: Express.Multer.File,
  ): Promise<Admin> {
    let updatedData: Admin;

    /* ------------------ MENGAMBIL DATA LAMA ------------------ */
    let oldData: Admin | null;
    try {
      oldData = await this.adminService.findOne({ where: { tlp } });
    } catch {
      throw new BadRequestException('Admin tidak ditemukan!');
    }

    /* ------------------ ADMIN MERUBAH NO. TLP ------------------
    |  Pastikan No. Tlp belum ada yang menggunakan, jika ada
    |  admin ataupun user yang menggunakan No. Tlp tersebut,
    |  permintaan input data ditolak.
    */
    if (data.tlp) {
      // Pastikan No. Tlp baru tidak sama dengan No. Tlp lama
      if (data.tlp != oldData?.tlp) {
        let alreadyUsed: boolean = false;
        try {
          // Pengecekan apakah ada admin yang menggunakan No. Tlp tersebut
          const admExist: any = await this.adminService.findOne({
            where: { tlp: data.tlp },
          });
          if (admExist) {
            // No. Tlp telah digunakan oleh seorang admin
            alreadyUsed = true;
          }
        } catch {}

        // Tidak ada admin yang menggunakan No. Tlp tersebut
        if (!alreadyUsed) {
          // Pengecekan apakah ada user yang menggunakan No. Tlp tersebut
          try {
            const usrExist: any = await this.userService.findOne({
              where: { tlp: data.tlp },
            });
            if (usrExist) {
              // No. Tlp telah digunakan oleh seorang user
              alreadyUsed = true;
            }
          } catch {}
        }

        // Jika ada admin atau user yang telah menggunakan No. Tlp tersebut
        if (alreadyUsed) {
          // Terminate task | Tolak permintaan input
          throw new BadRequestException(`No. Tlp ${data.tlp} telah digunakan!`);
        }
      }
    }

    /* ------------------ ADMIN MERUBAH PASSWORD ------------------ */
    if (data.password) {
      // Enkripsi password
      data.password = encryptPassword(data.password);
    }

    /* ------------------ ADMIN MERUBAH FOTO ------------------ */
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
      |  Nama foto berasal dari No. Tlp admin
      */
      const img_path = `${upload_img_dir}/admin/profile`;
      const img_name = tlp;
      data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);
    }

    /* ------------------ MENYIMPAN DATA ------------------ */
    try {
      updatedData = await this.adminService.update(
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
  async remove(@Param('tlp') tlp: string): Promise<Admin> {
    let deletedData: Admin;

    // Delete data from database
    try {
      deletedData = await this.adminService.remove({ tlp });
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
