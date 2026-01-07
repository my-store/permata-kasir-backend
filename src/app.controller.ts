import { FileInterceptor } from "@nestjs/platform-express";
import { existsSync, readdirSync, readFileSync } from "fs";
import { executeUpdate } from "./libs/updater";
import { ParseUrlQuery } from "./libs/string";
// import { AppService } from "./app.service";
import { IsNotEmpty } from "class-validator";
import { extname, join } from "path";
import {
    GetFileDestBeforeUpload,
    upload_update_from_dir,
    checkOrCreateDir,
    UploadFile,
} from "./libs/upload-file-handler";
import { glob } from "glob";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    UseInterceptors,
    UploadedFile,
    Controller,
    Param,
    Query,
    Post,
    Body,
    Get,
} from "@nestjs/common";

class UploadPayloadDto {
    @IsNotEmpty()
    file_path: string;
}

class ShLsDirDto {
    @IsNotEmpty()
    target_path: string;
}

class ShDeepLsDirDto {
    @IsNotEmpty()
    target_path: string;
}

class ShReadTextFileDto {
    @IsNotEmpty()
    target_path: string;
}

// Nanti harus ditambahkan fitur autentikasi
class ShellCommands {
    private readonly wrong_target_err: string = "Wrong target path!";
    private readonly create_dir_err: any = {
        exists: "Folder is already exist!",
        not_specified: "We expected folder name!",
    };

    // constructor(private readonly service: AppService) {}

    @Post("sh-ls-dir")
    shLsDir(@Body() { target_path }: ShLsDirDto): string[] {
        const folder_to_view: string = join(__dirname, "..", target_path);
        if (!existsSync(folder_to_view)) {
            throw new BadRequestException(this.wrong_target_err);
        }
        return readdirSync(folder_to_view);
    }

    @Post("sh-deep-ls-dir")
    async shExtractDir(
        @Body() { target_path }: ShDeepLsDirDto,
    ): Promise<string[]> {
        const folder_to_view: string = join(__dirname, "..", target_path);
        if (!existsSync(folder_to_view)) {
            throw new BadRequestException(this.wrong_target_err);
        }
        return glob(folder_to_view + "/**/*");
    }

    @Post("sh-read-text-file")
    async shReadTextFile(
        @Body() { target_path }: ShReadTextFileDto,
    ): Promise<string> {
        const file_to_view: string = join(__dirname, "..", target_path);
        if (!existsSync(file_to_view)) {
            throw new BadRequestException(this.wrong_target_err);
        }
        try {
            return readFileSync(file_to_view, "utf-8");
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
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

        let q: any = []; // User defined queries
        let c: any[] = []; // Created folders

        // Single dir
        if (query.single) {
            q.push(query.single);
        }

        // Multi dir
        if (query.multi) {
            q = [...q, ...query.multi];
        }

        for (let qx of q) {
            const target: string = join(__dirname, "..", qx);
            if (!existsSync(target)) {
                // Check and create folder if not exist
                try {
                    checkOrCreateDir(target);
                } catch (error) {
                    throw new InternalServerErrorException(error);
                }

                // Increase or insert into created folder
                c.push(target);
            }
        }

        // No folder is created
        if (c.length < 1) return "No folder has been created!";

        // FOlder is created
        return `${c.length} folder has been created:\n${c}`;
    }
}

@Controller()
export class AppController extends ShellCommands {
    // Nanti harus ditambahkan fitur autentikasi (hanya admin yang boleh meng-update server)
    @Get("update-execute/:dev_code")
    async updateExecute(@Param("dev_code") dev_code: string): Promise<void> {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_UPDATE_EXECUTE_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Execute update script
        try {
            return executeUpdate();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
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
