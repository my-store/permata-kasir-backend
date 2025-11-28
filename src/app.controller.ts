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
import { spawn } from "child_process";
import {
    upload_update_builder_dir,
    GetFileDestBeforeUpload,
    upload_update_from_dir,
    UploadFile,
} from "./libs/upload-file-handler";
import { extname } from "path";

@Controller()
export class AppController {
    @Get()
    index() {
        return "Oke";
    }

    @Get("update-execute/:dev_code")
    updateExecute(@Param("dev_code") dev_code: string) {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_UPDATE_EXECUTE_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }

        const py = spawn("python", ["update/builder/__init__.py"]);

        // Collect data from the Python script's standard output
        py.stdout.on("data", (data: any) => console.log(data.toString()));

        // Collect any errors
        py.stderr.on("data", (data: any) => console.log(data.toString()));

        // Handle process exit
        py.on("close", (data: any) => console.log(data.toString()));

        // Don't forget to install PM2 in global !!!

        // Signals an error exit, which prompts PM2 to restart the app immediately.
        process.exit(1);
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

        return "Update payload is updated!";
    }

    @Post("update-builder/:dev_code")
    @UseInterceptors(FilesInterceptor("files"))
    updateBuilder(
        @Param("dev_code") dev_code: string,
        @UploadedFiles()
        files: Array<Express.Multer.File>,
    ) {
        // Wrong developer key not presented
        if (!dev_code || dev_code != process.env.APP_UPDATE_BUILDER_DEVCODE) {
            // Terminate task
            throw new UnauthorizedException();
        }

        for (let f of files) {
            const fext: string = extname(f.originalname);
            const fname: string = f.originalname.replace(fext, "");
            const file_dest: string = GetFileDestBeforeUpload(
                f,
                upload_update_builder_dir,
                fname,
            );

            try {
                UploadFile(f, file_dest);
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
        }

        return "Update builder is updated!";
    }
}
