import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { NumberAddComma } from "./string";
import { dirname, extname } from "path";

export const dist_dir: string = "dist";
export const public_root_dir: string = "public";

// Update configurations
export const update_root_dir: string = "update";
export const upload_update_from_dir: string = `${update_root_dir}/payload`;
export const upload_update_to_dir: string = dist_dir;

// Image upload configurations
export const max_profile_img_size: number = 2097152;
export const profile_img_type: RegExp = /image\/png|image\/jpeg|image\/jpg/;
export const upload_img_dir: string = `${public_root_dir}/img`;

export interface ProfileImageValidatorResponse {
    status: boolean;
    message?: string;
}

export function ProfileImageValidator(
    file: Express.Multer.File,
): ProfileImageValidatorResponse {
    let response: ProfileImageValidatorResponse = {
        status: false,
    };

    // Wrong file-type
    if (!profile_img_type.test(file.mimetype)) {
        const mimetypes = profile_img_type
            .toString() // Ubah ke string
            .substring(1) // Menghapus garis-miring pertama
            .slice(0, -1) // Menghapus garis-miring terakhir
            .replaceAll("\\", "") // Menghapus seluruh back-slash
            .replaceAll("|", ", "); // Ubah or sign '|' menjadi koma
        response.status = false;
        response.message = `Ektensi foto yang di izinkan adalah [${mimetypes}]`;
    }

    // Correct file type
    else {
        // File size is too big
        if (file.size > max_profile_img_size) {
            response.status = false;
            response.message = `Ukuran foto maksimal nya adalah ${NumberAddComma(max_profile_img_size)} byte`;
        }

        // Image is validated (correct size & type)
        else {
            response.status = true;
        }
    }

    return response;
}

export function checkOrCreateDir(target: string) {
    if (!existsSync(target)) {
        mkdirSync(target, { recursive: true });
    }
}

export function UploadFile(file: Express.Multer.File, dest: string): void {
    // Check pr create a new folder if it's not exists
    checkOrCreateDir(dirname(dest));

    // Write a persintent file
    writeFileSync(dest, file.buffer);
}

export function GetFileDestBeforeUpload(
    file: Express.Multer.File,
    dir: string, // Full path, include root file directory
    filename: string, // Gived name by user
): string {
    const { originalname } = file;
    const ext = extname(originalname);

    // Create file full path
    const dest = `${dir}/${filename + ext}`;

    // Return full file path
    return dest;
}

export function DeleteFileOrDir(target: string) {
    return rmSync(target, { recursive: true });
}
