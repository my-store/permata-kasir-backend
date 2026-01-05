import { UpdateUserDto, UpdateUserPasswordDto } from "./dto/update-user.dto";
import { UserRegisterTicketService } from "./user.register.ticket.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRegisterTicket, User } from "models/client";
import { AdminService } from "src/admin/admin.service";
import {
    CreateUserDto,
    CreateUserRegisterTicketDto,
} from "./dto/create-user.dto";
import { encryptPassword } from "src/libs/bcrypt";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { UserService } from "./user.service";
import {
    GetFileDestBeforeUpload,
    ProfileImageValidator,
    upload_img_dir,
    DeleteFileOrDir,
    UploadFile,
} from "src/libs/upload-file-handler";
import * as bcrypt from "bcrypt";
import { join } from "path";
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
    Query,
    Patch,
    Param,
    Body,
    Post,
    Get,
} from "@nestjs/common";

@Controller("api/user")
export class UserController {
    constructor(
        private readonly registerTicketService: UserRegisterTicketService,
        private readonly adminService: AdminService,
        private readonly userService: UserService,
    ) {}

    /* =====================================================
    |  REGISTRASI
    |  =====================================================
    |  Saat user registrasi atau mengisi form di frontend,
    |  dibalik layar data tersebut disimpan browser-storage,
    |  sebelum melakukan submit, harus meminta kode aktivasi
    |  terlebih dahulu ke admin, kemudian kode aktivasi itu
    |  yang nantinya akan digunakan pada parameter dibawah.
    |  -----------------------------------------------------
    |  Kode tiket tersebut akan dihapus dari database,
    |  setelah user berhasil registrasi.
    */
    @Post("register/:ticket_code")
    @UseInterceptors(FileInterceptor("foto"))
    async register(
        @Param("ticket_code") ticket_code: string,
        @Body() newData: CreateUserDto,
        @UploadedFile()
        foto: Express.Multer.File,
    ): Promise<any> {
        // Pencarian tiket pada database
        let ticket: any = null;
        try {
            ticket = await this.registerTicketService.findOne({
                where: {
                    code: ticket_code,
                },
            });
        } catch {}

        // Wrong developer key not presented
        if (!ticket_code || !ticket) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Prepare data
        const data: any = {
            ...newData,

            // Parse to an integer
            adminId: parseInt(ticket.adminId),
            userRankingId: parseInt(ticket.userRankingId),
        };

        return this.create(data, foto, ticket_code);
    }

    /* =====================================================
    |  USER PRA-REGISTRASI - KHUSUS ADMIN
    |  =====================================================
    |  Sebelum user berhasil registrasi, admin harus
    |  membuatkan terlebihdahulu tiket pendaftaran
    |  yang nantinya akan digunakan user.
    */
    @UseGuards(AuthGuard)
    @Post("create-register-ticket")
    async createRegisterTicket(
        @Body() data: CreateUserRegisterTicketDto,
        @Request() req,
    ): Promise<UserRegisterTicket> {
        // Not admin but visited this route
        if (!req.user.role || req.user.role != "Admin") {
            // Block request
            throw new UnauthorizedException();
        }
        let newRegisterCode: UserRegisterTicket;
        try {
            newRegisterCode = await this.registerTicketService.create(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return newRegisterCode;
    }

    /* =====================================================
    |  VERIFIKASI PASSWORD
    |  =====================================================
    |  Sebelum user berhasil melakukan perubahan password,
    |  harus dilakukan terlebih dahulu apakah password lama
    |  betul, jika tidak maka perubahan password dibatalkan.
    */
    @UseGuards(AuthGuard)
    @Post("verify-password/:tlp")
    async checkPassword(
        @Param("tlp") tlp: string,
        @Body() { password }: UpdateUserPasswordDto,
    ): Promise<any> {
        /* ------------------ MENGAMBIL DATA LAMA ------------------ */
        let oldData: User | null;
        try {
            oldData = await this.userService.findOne({ where: { tlp } });
        } catch {
            throw new BadRequestException("User tidak ditemukan!");
        }

        const oldPassword: any = oldData?.password;
        const result = bcrypt.compareSync(password, oldPassword);
        return { result };
    }

    /* ----------------------------------------------------------
    |  INPUT DATA
    |  ----------------------------------------------------------
    */
    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor("foto"))
    async create(
        @Body() data: CreateUserDto,
        @UploadedFile()
        foto: Express.Multer.File,

        // Security - This method can only called from register method
        ticket_code: string = "",
    ): Promise<User> {
        // Someone accessing this route, block it!
        // Ticket code used for delete from database after insert user succeed
        if (ticket_code == "") {
            throw new UnauthorizedException();
        }

        let newData: any;

        /* ----------------------------------------------------------
        |  PENGECEKAN FOTO
        |  ----------------------------------------------------------
        |  Jika user tidak mengunggah foto, permintaan input secara
        |  otomatis akan ditolak.
        |  ----------------------------------------------------------
        |  Format dan ukuran foto akan di cek, format dan ukuran
        |  yang di izinkan:
        |  1. Format: JPG, PNG
        |  2. Ukuran <= 2 Megabyte
        |  ----------------------------------------------------------
        |  Lihat selengkapnya di:
        |  libs/upload-file-handler.ts/ProfileImageValidator()
        */
        if (!foto) {
            throw new BadRequestException("Wajib mengunggah foto!");
        }
        const { status, message } = ProfileImageValidator(foto);
        if (!status) {
            throw new BadRequestException(message);
        }

        /* ----------------------------------------------------------
        |  PENGECEKAN NO. TLP
        |  ----------------------------------------------------------
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
            throw new BadRequestException(
                `No. Tlp ${data.tlp} telah digunakan!`,
            );
        }

        /* ----------------------------------------------------------
        |  NAMA FOTO
        |  ----------------------------------------------------------
        |  Nama foto berasal dari No. Tlp user
        */
        const img_path = `${upload_img_dir}/user/profile`;
        const img_name = data.tlp;
        data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);

        /* ----------------------------------------------------------
        |  MENYIMPAN DATA
        |  ----------------------------------------------------------
        |  Simpan data dulu, foto hanya URL saja, upload file
        |  setelah berhasil menyimpan data.
        */
        try {
            newData = await this.userService.create({
                ...data,

                // Remove 'public' from image directory
                foto: data.foto.replace("public", ""),
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        /* ----------------------------------------------------------
        |  MENGUNGGAH FOTO
        |  ----------------------------------------------------------
        |  Setelah data berhasil disimpan, proses selanjutnya
        |  adalah mengunggah foto.
        */
        try {
            UploadFile(foto, data.foto);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        /* ----------------------------------------------------------
        |  HAPUS TIKET REGISTRASI
        |  ----------------------------------------------------------
        |  Setelah data berhasil disimpan, dan berhasil menghubungkan
        |  antara user dengan admin pembuatnya (pembuat tiket),
        |  tugas selanjutnya adalah menghapus tiket tersebut.
        |  ------------------------------------------------------------
        |  Agar tidak dapat digunakan lagi oleh orang lain.
        */
        try {
            await this.registerTicketService.remove({ code: ticket_code });
        } catch {}

        /* ----------------------------------------------------------
        |  SELESAI
        |  ----------------------------------------------------------
        |  Setelah data berhasil disimpan, dan foto
        |  berhasil di unggah, proses selanjutnya adalah
        |  mengembalikan data baru tersebut kepada client
        */
        return newData;
    }

    /* ----------------------------------------------------------
    |  GET ALL - GET WHERE - AND MORE
    |  ----------------------------------------------------------
    |  Mengambil seluruh data ataupun spesifik sesuai query
    */
    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: any): Promise<User[]> {
        let data: User[];
        try {
            data = await this.userService.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    /* ----------------------------------------------------------
    |  GET ONE
    |  ----------------------------------------------------------
    |  Getone method will return User object or null,
    |  so set return type as any.
    */
    @UseGuards(AuthGuard)
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Query() query: any,
    ): Promise<any> {
        let data: any;
        try {
            data = await this.userService.findOne({
                where: { uuid },
                ...ParseUrlQuery(query),
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @UseGuards(AuthGuard)
    @Patch(":tlp")
    async update(
        @Param("tlp") tlp: string,
        @Body() data: UpdateUserDto,
        @Request() req: any,
        @UploadedFile() foto?: Express.Multer.File,
    ): Promise<User> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let updatedData: User;

        /* ----------------------------------------------------------
        |  ATURAN PERUBAHAN DATA USER - 28 DESEMBER 2025
        |  ----------------------------------------------------------
        |  Pastikan hanya admin dan user sediri lah yang dapat
        |  merubah datanya, bukan user lain.
        |  ----------------------------------------------------------
        |  Metode pengecekan:
        |  1. Bandingkan nomor tlp yang ada di parameter yang mana
        |  itu akan digunakan untuk menemukan data user mana
        |  yang akan diubah.
        |  2. Jia nomor tlp pada parameter tidak sama dengan sub
        |  atau nomor tlp yang sekarang sedang aktif login,
        |  maka permintaan update di hentikan paksa.
        */

        // Data admin/ user yang sedang login
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Jika tlp dan sub tidak sama, blokir permintaan update
            if (tlp != sub) {
                throw new UnauthorizedException();
            }
        }

        /* ----------------------------------------------------------
        |  MENGAMBIL DATA LAMA
        |  ----------------------------------------------------------
        |  Jika data lama tidak ditemukan atau telah dihapus,
        |  maka permintaan ubah data dihentikan paksa.
        */
        let oldData: User | null;
        try {
            oldData = await this.userService.findOne({ where: { tlp } });
        } catch {
            throw new BadRequestException("User tidak ditemukan!");
        }

        /* ----------------------------------------------------------
        |  USER MERUBAH NO. TLP
        |  ----------------------------------------------------------
        |  Pastikan No. Tlp belum ada yang menggunakan, jika ada
        |  user ataupun admin yang menggunakan No. Tlp tersebut,
        |  permintaan ubah data ditolak.
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
                    throw new BadRequestException(
                        `No. Tlp ${data.tlp} telah digunakan!`,
                    );
                }
            }
        }

        /* ----------------------------------------------------------
        |  USER MERUBAH PASSWORD
        |  ----------------------------------------------------------
        |  Jika user melakukan perubahan pada password nya, maka
        |  maka akan dilakukan enkripsi ulang.
        */
        if (data.password) {
            // Enkripsi password baru
            data.password = encryptPassword(data.password);
        }

        /* ----------------------------------------------------------
        |  USER MERUBAH FOTO
        |  ----------------------------------------------------------
        |  Akan dilakukan pengecekan format dan ukuran
        |  pada foto baru.
        |  ----------------------------------------------------------
        |  Format yang dibolehkan: JPG, JPEG dan PNG
        |  Ukuran yang dibolehkan: 2 Megabyte
        |  ----------------------------------------------------------
        |  setelah berhasil diubah data URL foto pada database,
        |  barulah dilakukan upload foto.
        |  Penamaan foto akan disesuaikan dengan nomor tlp user.
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

            // Nama foto, sesuai nomor tlp user
            const img_path = `${upload_img_dir}/user/profile`;
            const img_name = tlp;
            // Mendapatkan URL foto dimana foto tersebut akan di upload,
            // untuk disimpan di database.
            data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);
        }

        // Menyimpan data
        try {
            updatedData = await this.userService.update(
                { tlp },
                {
                    // Data yang telah dibersihkan dari kolom2 yang memang tidak boleh diubah.
                    ...this.userService.cleanUpdateData(data),

                    // Menghapush "public" pada URL foto baru.
                    foto: data.foto?.replace("public", ""),
                },
            );
        } catch (e) {
            // Terjadi error saat melakukan perubahan data
            throw new InternalServerErrorException(e);
        }

        /* ----------------------------------------------------------
        |  UPLOAD FOTO BARU
        |  ----------------------------------------------------------
        |  Jika user melakukan perubahan foto, maka akan dilakukan
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

    /* ----------------------------------------------------------
    |  HAPUS DATA
    |  ----------------------------------------------------------
    */
    @UseGuards(AuthGuard)
    @Delete(":tlp")
    async remove(
        @Param("tlp") tlp: string,
        @Request() req: any,
    ): Promise<User> {
        let deletedData: any;

        // Data admin/ user yang sedang login
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Block request, if this request come from other user
            // but not this user (to be deleted) itself.
            if (sub != tlp) {
                throw new UnauthorizedException();
            }
        }

        // Delete data from database
        try {
            deletedData = await this.userService.remove({ tlp });
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
