import subprocess
import os

# Define the path to your repository
repo_path = '/home/ec2-user/flask-app'

# Define the branch you want to pull
branch_name = 'main'
remote_name = 'origin'

# Change to the repository directory
os.chdir(repo_path)

# Get the current timestamp
timestamp = datetime.now().strftime('%d %m %Y %H:%M')

# Execute git pull command
try:
    result = subprocess.run(['git', 'pull', remote_name, branch_name], check=True, text=True, capture_output=True)
    log_message = f"{timestamp} Git pull successful\n{result.stdout}\n"
    print(log_message)
except subprocess.CalledProcessError as e:
    log_message = f"{timestamp} Error during git pull\n{e.stderr}\n"
    print(log_message)

# Append the log message to the log file
with open(log_file_path, 'a') as log_file:
    log_file.write(log_message)