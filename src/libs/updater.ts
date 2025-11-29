import { spawn } from "child_process";
import { copyFileSync } from "fs";
import {
    upload_update_from_dir,
    upload_update_to_dir,
} from "./upload-file-handler";
import { join } from "path";
import { glob } from "glob";

export async function getUpdateFiles(): Promise<void> {
    const files = await glob(upload_update_from_dir + "/**/*");

    // Run the command only if update file is exist !
    if (files.length > 0) {
        // Copy all files
        for (let f of files) {
            const dest: string = join(
                upload_update_to_dir,
                `${f.split("payload").pop()}`,
            );
            await copyFileSync(f, dest);
        }

        // Restart backend server
        spawn("pm2 restart permata-kasir-backend");
    }
}

export function executeUpdate(): Promise<void> {
    return getUpdateFiles();
}
