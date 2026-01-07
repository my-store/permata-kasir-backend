import { spawn } from "child_process";
import { dirname, join } from "path";
import { copyFileSync } from "fs";
import {
    upload_update_from_dir,
    upload_update_to_dir,
    checkOrCreateDir,
    update_root_dir,
    DeleteFileOrDir,
} from "./upload-file-handler";
import { glob } from "glob";

export async function uploadUpdateFiles(): Promise<void> {
    const files = await glob(
        join(__dirname, "..", "..", upload_update_from_dir) + "/**/*",
        { nodir: true }, // Files only!
    );

    // Run the command only if update file is exist !
    if (files.length > 0) {
        // Copy all files
        for (let f of files) {
            const dest: string = join(
                __dirname,
                "..",
                "..",
                upload_update_to_dir,
                `${f.split("payload").pop()}`,
            );

            // Create a folder if it doesn't exist
            checkOrCreateDir(dirname(dest));

            // Copy update file
            copyFileSync(join(__dirname, "..", "..", f), dest);
        }

        // Remove / delete everything inside update folder
        DeleteFileOrDir(join(__dirname, "..", "..", update_root_dir));
    }
}

export async function executeUpdate(
    reload_server: boolean = true,
): Promise<void> {
    await uploadUpdateFiles();

    // Restart backend server (PRODUCTION ONLY)
    if (reload_server && process.env.DEPLOY_MODE == "production") {
        spawn(`pm2 restart ${process.env.APP_PM2_ID}`);
    }
}
