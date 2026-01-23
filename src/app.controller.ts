import { existsSync, readdirSync, readFileSync } from "fs";
import { generateId, ParseUrlQuery } from "./libs/string";
import { IsNotEmpty } from "class-validator";
import { AppService } from "./app.service";
import { join } from "path";
import {
    checkOrCreateDir,
} from "./libs/upload-file-handler";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    Controller,
    Request,
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

class ShGenerateRandomIdDto {
    @IsNotEmpty()
    length: number;
}

class ShUpdateEnvDto {
    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    new_value: string;
}

@Controller()
class ShellCommands {
    private readonly wrong_target_err: string = "Wrong target path!";
    private readonly create_dir_err: any = {
        exists: "Folder is already exist!",
        not_specified: "We expected folder name!",
    };

    constructor(private readonly service: AppService) {}

    @Post("sh-generate-random-id")
    shGenerateRandomId(
        @Body() data: ShGenerateRandomIdDto,
        @Request() req: any,
    ): string {
        // The request come from un-trusted (not Admin)
        if (req.user.role != "Admin") {
            // Terminate task
            throw new UnauthorizedException();
        }

        return generateId(data.length);
    }

    @Post("sh-update-env")
    shUpdateEnv(@Body() data: ShUpdateEnvDto, @Request() req: any) {
        // The request come from un-trusted (not Admin)
        if (req.user.role != "Admin") {
            // Terminate task
            throw new UnauthorizedException();
        }

        try {
            // Run update and get the result
            const [status, message] = this.service.updateEnv(
                data.key,
                data.new_value,
            );

            // Failed to update some data inside .env file
            if (!status) throw new InternalServerErrorException(message);

            // Data inside .env file is updated
            return message;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    @Post("sh-ls-dir")
    shLsDir(
        @Body() { target_path }: ShLsDirDto,
        @Request() req: any,
    ): string[] {
        // The request come from un-trusted (not Admin)
        if (req.user.role != "Admin") {
            // Terminate task
            throw new UnauthorizedException();
        }
        const folder_to_view: string = join(__dirname, "..", target_path);
        if (!existsSync(folder_to_view)) {
            throw new BadRequestException(this.wrong_target_err);
        }
        return readdirSync(folder_to_view);
    }

    @Post("sh-read-text-file")
    async shReadTextFile(
        @Body() { target_path }: ShReadTextFileDto,
        @Request() req: any,
    ): Promise<string> {
        // The request come from un-trusted (not Admin)
        if (req.user.role != "Admin") {
            // Terminate task
            throw new UnauthorizedException();
        }
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
    shCreateDir(@Query() args: any, @Request() req: any): string {
        // The request come from un-trusted (not Admin)
        if (req.user.role != "Admin") {
            // Terminate task
            throw new UnauthorizedException();
        }
        /* ===========================
        | Example:
        | ===========================
        | Single directory
        | ---------------------------
        | 1. dir-name
        | ?single=dir-name
        | 2. dir-name/sub-dir-name
        | ?single=dir-name/sub-dir-name
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
export class AppController extends ShellCommands {}
