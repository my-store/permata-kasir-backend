import { AdminServiceV1 } from "src/admin/v1/admin.service.v1";
import { UpdateKasirDtoV1 } from "./dto/update.kasir.v1.dto";
import { CreateKasirDtoV1 } from "./dto/create.kasir.v1.dto";
import { UserServiceV1 } from "src/user/v1/user.service.v1";
import { FileInterceptor } from "@nestjs/platform-express";
import { KasirServiceV1 } from "./kasir.service.v1";
import { ParseUrlQuery } from "src/libs/string";
import { Kasir, Prisma } from "models";
import {
    GetFileDestBeforeUpload,
    ProfileImageValidator,
    upload_img_dir,
    UploadFile,
} from "src/libs/upload-file-handler";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    UseInterceptors,
    UploadedFile,
    Controller,
    Request,
    Delete,
    Query,
    Patch,
    Param,
    Body,
    Post,
    Get,
} from "@nestjs/common";

@Controller({ version: "1", path: "kasir" })
export class KasirControllerV1 {
    constructor(
        private readonly service: KasirServiceV1,
        private readonly userService: UserServiceV1,
        private readonly adminService: AdminServiceV1,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor("foto"))
    async create(
        @Body() data: CreateKasirDtoV1,
        @UploadedFile() foto: Express.Multer.File,
        @Request() req: any,
    ): Promise<Kasir> {
        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.inputOwnerCheck({
                ...req.user,
                userId: parseInt(data.userId),
                tokoId: parseInt(data.tokoId),
            });
        } catch {
            throw new UnauthorizedException();
        }

        /* ----------------------------------------------------------
        |  PENGECEKAN FOTO
        |  ----------------------------------------------------------
        |  Jika kasir tidak mengunggah foto, permintaan input secara
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
        |  kasir, user ataupun admin yang menggunakan No. Tlp tersebut,
        |  permintaan input data ditolak.
        */
        let alreadyUsed: boolean = false;

        // Pengecekan No. Tlp pada tabel kasir
        try {
            // Pengecekan apakah ada kasir yang menggunakan No. Tlp tersebut
            const usrExist: any = await this.service.findOne({
                where: { tlp: data.tlp },
            });
            if (usrExist) {
                // No. Tlp telah digunakan oleh seorang kasir
                alreadyUsed = true;
            }
        } catch {}

        // Tidak ada kasir yang menggunakan No. Tlp tersebut
        if (!alreadyUsed) {
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
        }

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

        // Jika ada kasir, user atau admin yang telah menggunakan No. Tlp tersebut
        if (alreadyUsed) {
            // Terminate task | Tolak permintaan input
            throw new BadRequestException(
                `No. Tlp ${data.tlp} telah digunakan!`,
            );
        }

        /* ----------------------------------------------------------
        |  NAMA FOTO
        |  ----------------------------------------------------------
        |  Nama foto berasal dari No. Tlp kasir
        */
        const img_path = `${upload_img_dir}/kasir/profile`;
        const img_name = data.tlp;
        data.foto = GetFileDestBeforeUpload(foto, img_path, img_name);

        /* ----------------------------------------------------------
        |  MENYIMPAN DATA
        |  ----------------------------------------------------------
        |  Simpan data dulu, foto hanya URL saja, upload file
        |  setelah berhasil menyimpan data.
        */
        let createdKasir: Kasir;
        try {
            createdKasir = await this.service.create(
                // Cleaned insert data
                this.service.cleanInsertData(
                    // Add connection between child and parent table
                    {
                        ...data,

                        // Parse to integer, because this request is come from Form-Data
                        tokoId: parseInt(data.tokoId),

                        // Remove 'public' from image directory
                        foto: data.foto.replace("public", ""),
                    },
                ),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
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
        |  SELESAI
        |  ----------------------------------------------------------
        |  Setelah data berhasil disimpan, dan foto
        |  berhasil di unggah, proses selanjutnya adalah
        |  mengembalikan data baru tersebut kepada client
        */
        return createdKasir;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Kasir[]> {
        let kasir: Kasir[];
        try {
            kasir = await this.service.findAll(
                this.service.secureQueries({
                    queries: ParseUrlQuery(query),
                    headers: req.user,
                }),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return kasir;
    }

    // Getone method will return Kasir object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        const parsedQueries: any = ParseUrlQuery(query);
        let data: any;
        try {
            data = await this.service.findOne(
                this.service.secureQueries({
                    queries: {
                        // Query database yang dikirm pada URL
                        ...parsedQueries,

                        // Where statement
                        where: {
                            // Where statement pada query di URL (jika ada)
                            ...parsedQueries.where,

                            // Timpa dengan where.uuid = yang ada pada URL parameter
                            // jadi, pada query di URL tidak perlu menambahkan where={"uuid": "some_uuid"}.
                            uuid,
                        },
                    },
                    headers: req.user,
                }),
            );
        } catch {
            throw new NotFoundException();
        }
        return data;
    }

    @Patch(":tlp")
    async update(
        @Param("tlp") tlp: string,
        @Body() data: UpdateKasirDtoV1,
        @Request() req: any,
    ): Promise<Kasir> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }
        let kasir: Kasir;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.KasirWhereUniqueInput>{
                    tlp,
                },
            },
            headers: req.user,
        });
        try {
            kasir = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return kasir;
    }

    @Delete(":tlp")
    async remove(
        @Param("tlp") tlp: string,
        @Request() req: any,
    ): Promise<Kasir> {
        let kasir: Kasir;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.KasirWhereUniqueInput>{
                    tlp,
                },
            },
            headers: req.user,
        });
        try {
            kasir = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }
        return kasir;
    }
}
