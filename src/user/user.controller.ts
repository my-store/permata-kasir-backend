import { UpdateUserDto, UpdateUserPasswordDto } from "./dto/update-user.dto";
import { UserRegisterTicketService } from "./user.register.ticket.service";
import { UserRegisterTicket, Prisma, User } from "models/client";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdminService } from "src/admin/admin.service";
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
import {
    CreateUserRegisterTicketDto,
    CreateUserDto,
} from "./dto/create-user.dto";
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
        private readonly userService: UserService,
        private readonly userRegisterTicketService: UserRegisterTicketService,
        private readonly adminService: AdminService,
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
            ticket = await this.userRegisterTicketService.findOne({
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

            // Admin or parent data
            adminId: parseInt(ticket.adminId),
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
            newRegisterCode = await this.userRegisterTicketService.create(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return newRegisterCode;
    }

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
        if (ticket_code == "" || ticket_code.length < 1) {
            throw new UnauthorizedException();
        }

        let newData: any;

        /* ------------------ USER TIDAK MENGUNGGAH FOTO ------------------ */
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

        /* ------------------ HAPUS TIKET REGISTRASI ------------------
        |  Setelah data berhasil disimpan, dan berhasil menghubungkan
        |  antara user dengan admin pembuatnya (pembuat tiket),
        |  tugas selanjutnya adalah menghapus tiket tersebut.
        |  ------------------------------------------------------------
        |  Agar tidak dapat digunakan lagi oleh orang lain.
        */
        try {
            await this.userRegisterTicketService.remove({ code: ticket_code });
        } catch {}

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
        let data: User[];
        try {
            data = await this.userService.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return Admin object or nul, so set return type as any.
    @UseGuards(AuthGuard)
    @Get(":tlp")
    async findOne(@Param("tlp") tlp: string): Promise<any> {
        let data: any;
        try {
            data = await this.userService.findOne({ where: { tlp } });
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
        @UploadedFile() foto?: Express.Multer.File,
    ): Promise<User> {
        let updatedData: User;

        /* ------------------ MENGAMBIL DATA LAMA ------------------ */
        let oldData: User | null;
        try {
            oldData = await this.userService.findOne({ where: { tlp } });
        } catch {
            throw new BadRequestException("User tidak ditemukan!");
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
                    throw new BadRequestException(
                        `No. Tlp ${data.tlp} telah digunakan!`,
                    );
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
                    foto: data.foto?.replace("public", ""),
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
                DeleteFileOrDir(join(__dirname, "public", `${oldData?.foto}`));
            } catch (e) {
                throw new InternalServerErrorException(e);
            }

            // Mengunggah foto baru
            try {
                UploadFile(foto, "public" + updatedData.foto);
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
    @Delete(":tlp")
    async remove(@Param("tlp") tlp: string): Promise<User> {
        let deletedData: any;

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
