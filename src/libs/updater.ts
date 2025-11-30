import { copyFileSync, rmSync } from "fs";
import { spawn } from "child_process";
import { dirname, join } from "path";
import {
    upload_update_from_dir,
    upload_update_to_dir,
    checkOrCreateDir,
    update_root_dir,
} from "./upload-file-handler";
import { glob } from "glob";
import { InternalServerErrorException } from "@nestjs/common";

export async function mergeUpdateFiles(): Promise<void> {
    const files = await glob(upload_update_from_dir + "/**/*");

    // Run the command only if update file is exist !
    if (files.length > 0) {
        // Copy all files
        for (let f of files) {
            const dest: string = join(
                upload_update_to_dir,
                `${f.split("payload").pop()}`,
            );

            // Create a folder if it doesn't exist
            try {
                await checkOrCreateDir(dirname(dest));
            } catch (error) {
                throw new InternalServerErrorException(error);
            }

            // SOON will be fixed for subfolder copy!
            // Copy update file
            try {
                await copyFileSync(f, dest);
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
        }

        // Remove / delete everything inside update folder
        try {
            await rmSync(update_root_dir, { recursive: true });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

export async function executeUpdate(
    reload_server: boolean = true,
): Promise<void> {
    await mergeUpdateFiles();

    // Restart backend server (PRODUCTION ONLY)
    if (reload_server) {
        spawn("pm2 restart permata-kasir-backend");
    }
}
