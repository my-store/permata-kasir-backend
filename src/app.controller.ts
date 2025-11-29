import {
    InternalServerErrorException,
    UnauthorizedException,
    UseInterceptors,
    UploadedFiles,
    Controller,
    Param,
    Post,
    Get,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { executeUpdate } from "./libs/updater";
import { AppService } from "./app.service";
import {
    GetFileDestBeforeUpload,
    upload_update_from_dir,
    UploadFile,
} from "./libs/upload-file-handler";
import { extname } from "path";

@Controller()
export class AppController {
    constructor(private readonly service: AppService) {}

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

    @Post("update-payload/:dev_code")
    @UseInterceptors(FilesInterceptor("files"))
    updatePayload(
        @Param("dev_code") dev_code: string,
        @UploadedFiles()
        files: Array<Express.Multer.File>,
    ) {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_UPDATE_PAYLOAD_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }

        for (let f of files) {
            const fext: string = extname(f.originalname);
            const fname: string = f.originalname.replace(fext, "");
            const file_dest: string = GetFileDestBeforeUpload(
                f,
                upload_update_from_dir,
                fname,
            );

            try {
                UploadFile(f, file_dest);
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
        }

        return "Update payload is uploaded!";
    }
}
