import subprocess
import os

# Define the path to your repository
repo_path = '/home/ec2-user/flask-app'

# Define the branch you want to pull
branch_name = 'main'
remote_name = 'origin'

# Change to the repository directory
os.chdir(repo_path)

# Execute git pull command
try:
    result = subprocess.run(['git', 'pull', remote_name, branch_name], check=True, text=True, capture_output=True)
    print("Git pull successful:")
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print("Error during git pull:")
    print(e.stderr)
