import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    UseInterceptors,
    UploadedFile,
    Controller,
    Param,
    Post,
    Body,
    Get,
    Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { executeUpdate } from "./libs/updater";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { IsNotEmpty } from "class-validator";
import { AppService } from "./app.service";
import {
    GetFileDestBeforeUpload,
    upload_update_from_dir,
    UploadFile,
} from "./libs/upload-file-handler";
import { extname, join } from "path";
import { glob } from "glob";
import { ParseUrlQuery } from "./libs/string";

class UploadPayloadDto {
    @IsNotEmpty()
    file_path: string;
}

// Nanti harus ditambahkan fitur autentikasi
class ShellCommands {
    private readonly wrong_target_err: string = "Wrong target path!";
    private readonly create_dir_err: any = {
        exists: "Folder is already exist!",
        not_specified: "We expected folder name!",
    };

    constructor(private readonly service: AppService) {}

    @Get("sh-ls-dir/:target")
    shLsDir(@Param("target") target): string[] {
        if (!target || !existsSync(target)) {
            throw new BadRequestException(this.wrong_target_err);
        }
        return readdirSync(target);
    }

    @Get("sh-extract-dir/:target")
    async shExtractDir(@Param("target") target): Promise<string[]> {
        if (!target || !existsSync(target)) {
            throw new BadRequestException(this.wrong_target_err);
        }
        return glob(target + "/**/*");
    }

    @Get("sh-create-dir")
    shCreateDir(@Query() args: any): string {
        /* ===========================
        | Example:
        | ===========================

        | ---------------------------
        | Single directory
        | ---------------------------
        | 1. dir-name
        | ?single=dir-name
        | 2. dir-name/sub-dir-name
        | ?single=dir-name/sub-dir-name
        |
        | ---------------------------
        | Multi directory
        | ---------------------------
        | 1. dir-name
        | 1. dir-name/sub-dir-name/anything
        | => ?multi=['dir-name', '/dir-name/sub-dir-name/anything']
        */
        const query = ParseUrlQuery(args);

        // No folder specified
        if (!query.single && !query.multi) {
            throw new BadRequestException(this.create_dir_err.not_specified);
        }

        let q: any = [];

        // Single dir
        if (query.single) {
            q.push(query.single);
        }

        // Multi dir
        if (query.multi) {
            q = [...q, ...query.multi];
        }

        for (let qx of q) {
            try {
                mkdirSync(qx, { recursive: true });
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
        }

        return q;
    }
}

@Controller()
export class AppController extends ShellCommands {
    // Nanti harus ditambahkan fitur autentikasi (hanya admin yang boleh meng-update server)
    @Get("update-execute/:dev_code")
    updateExecute(@Param("dev_code") dev_code: string) {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_UPDATE_EXECUTE_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Execute update script
        return executeUpdate();
    }

    // Nanti harus ditambahkan fitur autentikasi (hanya admin yang boleh meng-update server)
    @Post("update-payload/:dev_code")
    @UseInterceptors(FileInterceptor("file"))
    updatePayload(
        @Param("dev_code") dev_code: string,
        @UploadedFile()
        file: Express.Multer.File,
        @Body() { file_path }: UploadPayloadDto,
    ) {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_UPDATE_PAYLOAD_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // No file uploaded
        if (!file) {
            throw new BadRequestException("Wajib mengunggah file!");
        }

        const fext: string = extname(file.originalname);
        const fname: string = file.originalname.replace(fext, "");
        const file_dest: string = GetFileDestBeforeUpload(
            file,
            join(upload_update_from_dir, file_path),
            fname,
        );

        try {
            UploadFile(file, file_dest);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return "Update payload is uploaded!";
    }
}
