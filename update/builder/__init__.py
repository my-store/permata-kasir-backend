from os import walk, path, makedirs
from datetime import datetime
import shutil

update_from_dir: str = '../payload'
update_to_dir: str = '../../dist'


def log(txt: str):
    date = datetime.now()
    print(date)
    print(txt)
    print('-'*50)


def update_payload():
    if not path.exists(update_from_dir):
        return log('Folder "dist" tidak ditemukan!')

    for root, subfolders, files in walk(update_from_dir):
        for f in files:
            file_src = path.join(root, f)
            file_dest = path.join(root.replace(update_from_dir, update_to_dir), f)
            file_dir = path.dirname(file_dest)

            # Create folder if not exits
            if not path.exists(file_dir):
                log(f'Creating folder "{file_dir}"')
                makedirs(file_dir)

            # Copy file
            log(f'Copy file...\nFrom "{file_src}"\nTo "{file_dest}"')
            shutil.copy(file_src, file_dest)


if __name__ == "__main__":
    update_payload()