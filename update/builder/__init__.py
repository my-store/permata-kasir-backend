import subprocess
import platform


# Kill nodejs process
def kill_server():
    os = platform.system()

    command = []

    if os == 'Windows':
        command += ["taskkill", "/F", "/IM", "node.exe"]

    elif os == "Linux" or os == "Darwin":
        command += ["pkill", "node"]

    try:
        subprocess.run(command)
    except:
        print('No')
        pass


def update_payload():
    pass


if __name__ == "__main__":
    kill_server()
    update_payload()