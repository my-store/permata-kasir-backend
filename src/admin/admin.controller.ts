import { UpdateAdminDto, UpdateAdminPasswordDto } from "./dto/update-admin.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UserService } from "src/user/user.service";
import { encryptPassword } from "src/libs/bcrypt";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { AdminService } from "./admin.service";
import { Prisma, Admin } from "models/client";
import * as bcrypt from "bcrypt";
import {
    GetFileDestBeforeUpload,
    ProfileImageValidator,
    upload_img_dir,
    DeleteFileOrDir,
    UploadFile,
} from "src/libs/upload-file-handler";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    UseInterceptors,
    UploadedFile,
    Controller,
    UseGuards,
    Request,
    Delete,
    Patch,
    Param,
    Query,
    Body,
    Post,
    Get,
} from "@nestjs/common";
import { join } from "path";

@Controller("api/admin")
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly userService: UserService,
    ) {}

    cleanUpdateData(d: any): any {
        const {
            // Disabled data to be updated
            id,
            uuid,
            createdAt,
            updatedAt,

            // Fixed | Now data update will be save
            ...cleanedData
        }: any = d;
        return cleanedData;
    }

    // Look at .env file
    // The URL should be '/api/admin/register/APP_ADMIN_REGISTER_DEVCODE'
    @Post("register/:dev_code")
    @UseInterceptors(FileInterceptor("foto"))
    async register(
        @Param("dev_code") dev_code: string,
        @Body() data: CreateAdminDto,
        @UploadedFile()
        foto: Express.Multer.File,
    ): Promise<any> {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_ADMIN_REGISTER_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }
        return this.create(data, foto);
    }

    @UseGuards(AuthGuard)
    @Post("verify-password/:tlp")
    async checkPassword(
        @Param("tlp") tlp: string,
        @Body() { password }: UpdateAdminPasswordDto,
    ): Promise<any> {
        /* ------------------ MENGAMBIL DATA LAMA ------------------ */
        let oldData: Admin | null;
        try {
            oldData = await this.adminService.findOne({ where: { tlp } });
        } catch {
            throw new BadRequestException("Admin tidak ditemukan!");
        }

        const oldPassword: any = oldData?.password;
        const result = bcrypt.compareSync(password, oldPassword);
        return { result };
    }

    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor("foto"))
    async create(
        @Body() data: CreateAdminDto,
        @UploadedFile()
        foto: Express.Multer.File,
    ): Promise<Admin> {
        let newData: any;

        /* ------------------ ADMIN TIDAK MENGUNGGAH FOTO ------------------ */
        if (!foto) {
            throw new BadRequestException("Wajib mengunggah foto!");
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
            throw new BadRequestException(
                `No. Tlp ${data.tlp} telah digunakan!`,
            );
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
                foto: data.foto.replace("public", ""),
            });
        } catch (e) {
            // Unique constraint error
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                // The .code property can be accessed in a type-safe manner
                if (e.code === "P2002") {
                    throw new BadRequestException(
                        "There is a unique constraint violation.",
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
        let data: Admin[];
        try {
            data = await this.adminService.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return Admin object or nul, so set return type as any.
    @UseGuards(AuthGuard)
    @Get(":tlp")
    async findOne(
        @Param("tlp") tlp: string,
        @Query() query: any,
    ): Promise<any> {
        let data: any;
        try {
            data = await this.adminService.findOne({
                where: { tlp },
                ...ParseUrlQuery(query),
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @UseGuards(AuthGuard)
    @Patch(":tlp")
    @UseInterceptors(FileInterceptor("foto"))
    async update(
        @Param("tlp") tlp: string,
        @Body() data: UpdateAdminDto,
        @Request() req: any,
        @UploadedFile() foto?: Express.Multer.File,
    ): Promise<Admin> {
        let updatedData: Admin;

        /* ----------------------------------------------------------
        |  ATURAN PERUBAHAN DATA ADMIN - 28 DESEMBER 2025
        |  ----------------------------------------------------------
        |  Pastikan hanya admin sendiri lah yang dapat
        |  merubah datanya, bukan admin lain apalagi user.
        |  ----------------------------------------------------------
        |  Metode pengecekan:
        |  1. Bandingkan nomor tlp yang ada di parameter yang mana
        |  itu akan digunakan untuk menemukan data admin mana
        |  yang akan diubah.
        |  2. Jia nomor tlp pada parameter tidak sama dengan sub
        |  atau nomor tlp yang sekarang sedang aktif login,
        |  maka permintaan update di hentikan paksa.
        */

        // Data admin/ user yang sedang login
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (
            // User ingin merubah data admin
            role != "Admin" ||
            // Atau admin lain ingin merubah data seorang admin (bukan data dia sendiri)
            tlp != sub
        ) {
            // Blokir permintaan update
            throw new UnauthorizedException();
        }

        /* ----------------------------------------------------------
        |  MENGAMBIL DATA LAMA
        |  ----------------------------------------------------------
        |  Jika data lama tidak ditemukan atau telah dihapus,
        |  maka permintaan ubah data dihentikan paksa.
        */
        let oldData: Admin | null;
        try {
            oldData = await this.adminService.findOne({ where: { tlp } });
        } catch {
            throw new BadRequestException("Admin tidak ditemukan!");
        }

        /* ----------------------------------------------------------
        |  ADMIN MERUBAH NO. TLP
        |  ----------------------------------------------------------
        |  Pastikan No. Tlp belum ada yang menggunakan, jika ada
        |  admin ataupun user yang menggunakan No. Tlp tersebut,
        |  permintaan ubah data ditolak.
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
                    throw new BadRequestException(
                        `No. Tlp ${data.tlp} telah digunakan!`,
                    );
                }
            }
        }

        /* ----------------------------------------------------------
        |  ADMIN MERUBAH PASSWORD
        |  ----------------------------------------------------------
        |  Jika admin melakukan perubahan pada password nya, maka
        |  maka akan dilakukan enkripsi ulang.
        */
        if (data.password) {
            // Enkripsi password baru
            data.password = encryptPassword(data.password);
        }

        /* ----------------------------------------------------------
        |  ADMIN MERUBAH FOTO
        |  ----------------------------------------------------------
        |  Akan dilakukan pengecekan format dan ukuran
        |  pada foto baru.
        |  ----------------------------------------------------------
        |  Format yang dibolehkan: JPG, JPEG dan PNG
        |  Ukuran yang dibolehkan: 2 Megabyte
        |  ----------------------------------------------------------
        |  setelah berhasil diubah data URL foto pada database,
        |  barulah dilakukan upload foto.
        |  Penamaan foto akan disesuaikan dengan nomor tlp admin.
        |  ----------------------------------------------------------
        |  Selengkapnya dapat dilihat di:
        |  libs/upload-file-handler.ts/ProfileImageValidator()
        */
        if (foto) {
            // Pengecekan format dan ukuran foto
            const { status, message } = ProfileImageValidator(foto);
            // Format atau ukuran tidak sesuai aturan
            if (!status) {
                // Hentikan paksa
                throw new BadRequestException(message);
            }

            // Nama foto, sesuai nomor tlp admin
            const img_path = `${upload_img_dir}/admin/profile`;
            const img_name = tlp;
            // Mendapatkan URL foto dimana foto tersebut akan di upload,
            // untuk disimpan di database.
            data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);
        }

        // Menyimpan data
        try {
            updatedData = await this.adminService.update(
                { tlp },
                {
                    // Data yang telah dibersihkan dari kolom2 yang memang tidak boleh diubah.
                    ...this.cleanUpdateData(data),

                    // Menghapush "public" pada URL foto baru.
                    foto: data.foto?.replace("public", ""),
                },
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        /* ----------------------------------------------------------
        |  UPLOAD FOTO BARU
        |  ----------------------------------------------------------
        |  Jika admin melakukan perubahan foto, maka akan dilakukan
        |  penghapusan foto lama terlebih dahulu, setelah itu akan
        |  dilakukan upload pada foto baru nya.
        */
        if (foto) {
            // Menghapus foto lama
            try {
                DeleteFileOrDir(join(__dirname, "public", `${oldData?.foto}`));
            } catch (e) {
                // Terjadi error saat melakukan penghapusan foto lama
                throw new InternalServerErrorException(e);
            }

            // Upload foto baru
            try {
                UploadFile(foto, "public" + updatedData.foto);
            } catch (e) {
                // Terjadi error saat melakukan upload foto baru
                throw new InternalServerErrorException(e);
            }
        }

        /* ----------------------------------------------------------
        |  SELESAI
        |  ----------------------------------------------------------
        |  Setelah data berhasil disimpan, dan foto (jika ada)
        |  berhasil di unggah, proses selanjutnya adalah
        |  mengembalikan data baru tersebut kepada client.
        */
        return updatedData;
    }

    @UseGuards(AuthGuard)
    @Delete(":tlp")
    async remove(
        @Param("tlp") tlp: string,
        @Request() req: any,
    ): Promise<Admin> {
        let deletedData: any;

        // Data admin/ user yang sedang login
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (
            // User ingin menghapus data admin
            role != "Admin" ||
            // Atau admin lain ingin menghapus data seorang admin (bukan data dia sendiri)
            tlp != sub
        ) {
            // Blokir permintaan hapus
            throw new UnauthorizedException();
        }

        // Delete data from database
        try {
            deletedData = await this.adminService.remove({ tlp });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        // Delete image profile too
        try {
            // Dont forget to add 'public' int the path
            DeleteFileOrDir(join(__dirname, "public", deletedData.foto));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        // Data yang berhasil di hapus dari database
        return deletedData;
    }
}
